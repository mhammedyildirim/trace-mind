import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AppConfig } from '../../common/config/app.config';
import {
  NormalizedTrace,
  NormalizedSpan,
} from '../../normalization/models/trace.model';
import { SpanTree } from './span-tree-builder.service';
import { SYSTEM_PROMPT, buildUserPrompt } from '../prompts/analysis-prompts';

export interface AnalysisReport {
  rootCause: string;
  evidence: string[];
  suggestedFixes: string[];
  risks: string[];
}

@Injectable()
export class TraceAnalyzerService {
  private readonly logger = new Logger(TraceAnalyzerService.name);
  private readonly genAI: GoogleGenerativeAI;
  private readonly model: ReturnType<GoogleGenerativeAI['getGenerativeModel']>;

  constructor(private readonly config: AppConfig) {
    this.genAI = new GoogleGenerativeAI(config.geminiApiKey);
    this.model = this.genAI.getGenerativeModel({ model: config.geminiModel });
  }

  async analyzeWithGemini(
    trace: NormalizedTrace,
    spanTree: SpanTree,
    dominantSpan: NormalizedSpan,
    spanTypeDistribution: Record<string, number>,
  ): Promise<AnalysisReport> {
    try {
      const userPrompt = buildUserPrompt(
        trace,
        dominantSpan,
        spanTree,
        spanTypeDistribution,
      );

      this.logger.debug(`Analyzing trace ${trace.traceId} with Gemini`);

      const prompt = SYSTEM_PROMPT + '\n\n' + userPrompt;

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(
            new Error(
              `Analysis timeout after ${this.config.maxAnalysisTimeoutMs}ms`,
            ),
          );
        }, this.config.maxAnalysisTimeoutMs);
      });

      const result = await Promise.race([
        this.model.generateContent(prompt),
        timeoutPromise,
      ]);

      const response = result.response;
      const text = response.text();

      this.logger.debug(
        `Gemini raw response for trace ${trace.traceId}: ${text}`,
      );

      const analysis = this.extractJsonFromResponse(text, trace.traceId);

      this.logger.log(
        `Gemini analysis for trace ${trace.traceId}: ${JSON.stringify(analysis, null, 2)}`,
      );

      if (
        !analysis.rootCause ||
        !Array.isArray(analysis.evidence) ||
        !Array.isArray(analysis.suggestedFixes) ||
        !Array.isArray(analysis.risks)
      ) {
        throw new Error('Invalid analysis structure from Gemini');
      }

      return analysis;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to analyze trace ${trace.traceId}: ${errorMessage}`,
        errorStack,
      );
      throw new Error(`Gemini analysis failed: ${errorMessage}`);
    }
  }

  private extractJsonFromResponse(
    text: string,
    traceId: string,
  ): AnalysisReport {
    try {
      const parsed = JSON.parse(text.trim()) as unknown;
      if (this.isValidAnalysisReport(parsed)) {
        return parsed;
      }
    } catch {
      // Ignore parse errors, will try alternative extraction method
    }

    const jsonObject = this.findFirstJsonObject(text);
    if (jsonObject) {
      try {
        const parsed = JSON.parse(jsonObject) as unknown;
        if (this.isValidAnalysisReport(parsed)) {
          return parsed;
        }
      } catch (parseError) {
        this.logger.warn(
          `Failed to parse extracted JSON for trace ${traceId}: ${parseError}`,
        );
      }
    }

    this.logger.error(
      `Failed to extract JSON from Gemini response for trace ${traceId}. Raw response: ${text.substring(0, 500)}...`,
    );
    throw new Error(
      'Unable to extract valid JSON from Gemini response. Response may be malformed.',
    );
  }

  private findFirstJsonObject(text: string): string | null {
    let braceCount = 0;
    let startIndex = -1;

    for (let i = 0; i < text.length; i++) {
      if (text[i] === '{') {
        if (startIndex === -1) {
          startIndex = i;
        }
        braceCount++;
      } else if (text[i] === '}') {
        braceCount--;
        if (braceCount === 0 && startIndex !== -1) {
          return text.substring(startIndex, i + 1);
        }
      }
    }

    return null;
  }

  private isValidAnalysisReport(obj: unknown): obj is AnalysisReport {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      'rootCause' in obj &&
      typeof (obj as { rootCause: unknown }).rootCause === 'string' &&
      'evidence' in obj &&
      Array.isArray((obj as { evidence: unknown }).evidence) &&
      'suggestedFixes' in obj &&
      Array.isArray((obj as { suggestedFixes: unknown }).suggestedFixes) &&
      'risks' in obj &&
      Array.isArray((obj as { risks: unknown }).risks)
    );
  }
}

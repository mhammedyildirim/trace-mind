import { Injectable, Logger } from '@nestjs/common';
import { OtlpTracePayload } from '../../common/types/otlp.types';
import { NormalizerService } from '../../normalization/services/normalizer.service';
import { AnalysisOrchestratorService } from '../../analysis/services/analysis-orchestrator.service';
import { AnalysisResponseDto } from '../../dto/analysis-response.dto';
import { AppConfig } from '../../common/config/app.config';

@Injectable()
export class IngestService {
  private readonly logger = new Logger(IngestService.name);

  constructor(
    private readonly normalizer: NormalizerService,
    private readonly analysisOrchestrator: AnalysisOrchestratorService,
    private readonly config: AppConfig,
  ) {}

  async processTrace(
    otlpPayload: OtlpTracePayload,
  ): Promise<AnalysisResponseDto> {
    this.logger.debug('Processing trace ingestion');

    const normalizedTrace = this.normalizer.normalize(otlpPayload);

    if (normalizedTrace.totalDuration < this.config.minTraceDurationMs) {
      this.logger.debug(
        `Trace ${normalizedTrace.traceId} duration (${normalizedTrace.totalDuration}ms) below threshold (${this.config.minTraceDurationMs}ms), skipping analysis`,
      );
      return this.createMinimalResponse(normalizedTrace);
    }

    const analysis =
      await this.analysisOrchestrator.analyzeTrace(normalizedTrace);

    const dominantSpan = this.findDominantSpan(normalizedTrace);
    const percentageOfTotal =
      normalizedTrace.totalDuration > 0
        ? (dominantSpan.duration / normalizedTrace.totalDuration) * 100
        : 0;

    return {
      traceId: normalizedTrace.traceId,
      totalDuration: normalizedTrace.totalDuration,
      dominantSpan: {
        spanId: dominantSpan.spanId,
        operationName: dominantSpan.operationName,
        duration: dominantSpan.duration,
        spanType: dominantSpan.spanType,
        percentageOfTotal: parseFloat(percentageOfTotal.toFixed(1)),
      },
      rootCause: analysis.rootCause,
      evidence: analysis.evidence,
      suggestedFixes: analysis.suggestedFixes,
      risks: analysis.risks,
    };
  }

  private findDominantSpan(normalizedTrace: {
    spans: Array<{
      spanId: string;
      operationName: string;
      duration: number;
      spanType: string;
    }>;
  }) {
    return normalizedTrace.spans.reduce((max, span) =>
      span.duration > max.duration ? span : max,
    );
  }

  private createMinimalResponse(normalizedTrace: {
    traceId: string;
    totalDuration: number;
    spans: Array<{
      spanId: string;
      operationName: string;
      duration: number;
      spanType: string;
    }>;
  }): AnalysisResponseDto {
    const dominantSpan = this.findDominantSpan(normalizedTrace);
    const percentageOfTotal =
      normalizedTrace.totalDuration > 0
        ? (dominantSpan.duration / normalizedTrace.totalDuration) * 100
        : 0;

    return {
      traceId: normalizedTrace.traceId,
      totalDuration: normalizedTrace.totalDuration,
      dominantSpan: {
        spanId: dominantSpan.spanId,
        operationName: dominantSpan.operationName,
        duration: dominantSpan.duration,
        spanType: dominantSpan.spanType,
        percentageOfTotal: parseFloat(percentageOfTotal.toFixed(1)),
      },
      rootCause:
        'Trace duration is below analysis threshold. No significant performance issues detected.',
      evidence: [
        `Total trace duration: ${normalizedTrace.totalDuration}ms`,
        `Dominant span: ${dominantSpan.operationName} (${dominantSpan.duration}ms)`,
      ],
      suggestedFixes: [],
      risks: [],
    };
  }
}

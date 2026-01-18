import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  HttpException,
  Logger,
} from '@nestjs/common';
import { IngestService } from '../services/ingest.service';
import type { OtlpTracePayload } from '../../common/types/otlp.types';
import { AnalysisResponseDto } from '../../dto/analysis-response.dto';

@Controller('v1')
export class IngestController {
  private readonly logger = new Logger(IngestController.name);

  constructor(private readonly ingestService: IngestService) {}

  @Post('traces')
  @HttpCode(HttpStatus.OK)
  async ingestTrace(
    @Body() payload: OtlpTracePayload,
  ): Promise<AnalysisResponseDto> {
    try {
      this.validatePayload(payload);

      const result = await this.ingestService.processTrace(payload);

      this.logger.log(
        `Successfully analyzed trace ${result.traceId} (${result.totalDuration}ms)`,
      );

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Trace ingestion failed: ${errorMessage}`, errorStack);

      if (error instanceof HttpException) {
        throw error;
      }

      if (errorMessage.includes('Gemini') || errorMessage.includes('LLM')) {
        throw new HttpException(
          {
            error: 'LLM service unavailable',
            message: errorMessage,
          },
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }

      throw new HttpException(
        {
          error: 'Analysis failed',
          message: errorMessage,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private validatePayload(payload: unknown): void {
    if (!payload) {
      throw new HttpException(
        {
          error: 'Invalid OTLP payload',
          message: 'Payload is required',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (
      !payload ||
      typeof payload !== 'object' ||
      !('resourceSpans' in payload) ||
      !Array.isArray((payload as { resourceSpans?: unknown }).resourceSpans)
    ) {
      throw new HttpException(
        {
          error: 'Invalid OTLP payload',
          message: 'Missing required field: resourceSpans',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const resourceSpans = (payload as { resourceSpans: unknown[] })
      .resourceSpans;
    if (resourceSpans.length === 0) {
      throw new HttpException(
        {
          error: 'Invalid OTLP payload',
          message: 'resourceSpans array is empty',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    let hasSpans = false;
    let traceIdFound = false;
    for (const resourceSpan of resourceSpans) {
      if (
        resourceSpan &&
        typeof resourceSpan === 'object' &&
        'scopeSpans' in resourceSpan &&
        Array.isArray((resourceSpan as { scopeSpans?: unknown }).scopeSpans)
      ) {
        const scopeSpans = (resourceSpan as { scopeSpans: unknown[] })
          .scopeSpans;
        for (const scopeSpan of scopeSpans) {
          if (
            scopeSpan &&
            typeof scopeSpan === 'object' &&
            'spans' in scopeSpan &&
            Array.isArray((scopeSpan as { spans?: unknown }).spans)
          ) {
            const spans = (scopeSpan as { spans: unknown[] }).spans;
            if (spans.length > 0) {
              hasSpans = true;

              for (const span of spans) {
                if (
                  span &&
                  typeof span === 'object' &&
                  'traceId' in span &&
                  typeof (span as { traceId?: unknown }).traceId === 'string' &&
                  (span as { traceId: string }).traceId.length > 0
                ) {
                  traceIdFound = true;
                }

                if (
                  !span ||
                  typeof span !== 'object' ||
                  !('spanId' in span) ||
                  typeof (span as { spanId?: unknown }).spanId !== 'string' ||
                  (span as { spanId: string }).spanId.length === 0
                ) {
                  throw new HttpException(
                    {
                      error: 'Invalid OTLP payload',
                      message: 'Span missing required field: spanId',
                    },
                    HttpStatus.BAD_REQUEST,
                  );
                }

                if (
                  !('startTimeUnixNano' in span) ||
                  typeof (span as { startTimeUnixNano?: unknown })
                    .startTimeUnixNano !== 'string' ||
                  (span as { startTimeUnixNano: string }).startTimeUnixNano
                    .length === 0
                ) {
                  throw new HttpException(
                    {
                      error: 'Invalid OTLP payload',
                      message: 'Span missing required field: startTimeUnixNano',
                    },
                    HttpStatus.BAD_REQUEST,
                  );
                }
              }
              break;
            }
          }
        }
      }
      if (hasSpans) break;
    }

    if (!hasSpans) {
      throw new HttpException(
        {
          error: 'Invalid OTLP payload',
          message: 'No spans found in resourceSpans',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!traceIdFound) {
      throw new HttpException(
        {
          error: 'Invalid OTLP payload',
          message: 'No traceId found in spans',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}

import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  HttpException,
  Logger,
} from '@nestjs/common';
import { IngestService } from '../../ingestion/services/ingest.service';
import { AnalysisResponseDto } from '../../dto/analysis-response.dto';
import type { OtlpTracePayload } from '../../common/types/otlp.types';

@Controller('v1')
export class OtlpReceiverController {
  private readonly logger = new Logger(OtlpReceiverController.name);

  constructor(private readonly ingestService: IngestService) {}

  @Post('traces')
  @HttpCode(HttpStatus.OK)
  async receiveTraces(
    @Body() body: OtlpTracePayload,
  ): Promise<AnalysisResponseDto> {
    try {
      this.logger.debug('Received OTLP JSON payload');

      const result = await this.ingestService.processTrace(body);

      this.logger.log(
        `Successfully analyzed trace ${result.traceId} (${result.totalDuration}ms)`,
      );

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`OTLP receiver failed: ${errorMessage}`, errorStack);

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
          error: 'Trace processing failed',
          message: errorMessage,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

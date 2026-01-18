import { Injectable, Logger } from '@nestjs/common';
import { NormalizedTrace } from '../../normalization/models/trace.model';
import { SpanTreeBuilderService } from './span-tree-builder.service';
import { TraceAnalyzerService, AnalysisReport } from './trace-analyzer.service';

@Injectable()
export class AnalysisOrchestratorService {
  private readonly logger = new Logger(AnalysisOrchestratorService.name);

  constructor(
    private readonly spanTreeBuilder: SpanTreeBuilderService,
    private readonly traceAnalyzer: TraceAnalyzerService,
  ) {}

  async analyzeTrace(trace: NormalizedTrace): Promise<AnalysisReport> {
    this.logger.debug(`Starting analysis for trace ${trace.traceId}`);

    const spanTree = this.spanTreeBuilder.buildSpanTree(trace.spans);
    const dominantSpan = spanTree.dominantSpan;

    const spanTypeDistribution = this.spanTreeBuilder.getSpanTypeDistribution(
      trace.spans,
    );

    const analysis = await this.traceAnalyzer.analyzeWithGemini(
      trace,
      spanTree,
      dominantSpan,
      spanTypeDistribution,
    );

    this.logger.debug(`Analysis completed for trace ${trace.traceId}`);

    return analysis;
  }
}

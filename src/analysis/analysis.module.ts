import { Module } from '@nestjs/common';
import { AnalysisOrchestratorService } from './services/analysis-orchestrator.service';
import { SpanTreeBuilderService } from './services/span-tree-builder.service';
import { TraceAnalyzerService } from './services/trace-analyzer.service';
import { ConfigModule } from '../common/config/config.module';

@Module({
  imports: [ConfigModule],
  providers: [
    AnalysisOrchestratorService,
    SpanTreeBuilderService,
    TraceAnalyzerService,
  ],
  exports: [AnalysisOrchestratorService],
})
export class AnalysisModule {}

import { Module } from '@nestjs/common';
import { IngestService } from './services/ingest.service';
import { NormalizationModule } from '../normalization/normalization.module';
import { AnalysisModule } from '../analysis/analysis.module';
import { ConfigModule } from '../common/config/config.module';

@Module({
  imports: [NormalizationModule, AnalysisModule, ConfigModule],
  controllers: [],
  providers: [IngestService],
  exports: [IngestService],
})
export class IngestionModule {}

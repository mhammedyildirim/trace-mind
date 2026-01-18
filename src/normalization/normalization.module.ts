import { Module } from '@nestjs/common';
import { NormalizerService } from './services/normalizer.service';

@Module({
  providers: [NormalizerService],
  exports: [NormalizerService],
})
export class NormalizationModule {}

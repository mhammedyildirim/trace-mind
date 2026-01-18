import { Module } from '@nestjs/common';
import { OtlpReceiverController } from './controllers/otlp-receiver.controller';
import { IngestionModule } from '../ingestion/ingestion.module';

@Module({
  imports: [IngestionModule],
  controllers: [OtlpReceiverController],
  providers: [],
})
export class OtlpReceiverModule {}

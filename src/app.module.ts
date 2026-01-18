import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IngestionModule } from './ingestion/ingestion.module';
import { OtlpReceiverModule } from './otlp-receiver/otlp-receiver.module';
import { ConfigModule } from './common/config/config.module';
import { HealthController } from './common/controllers/health.controller';
import { AppConfig } from './common/config/app.config';

@Module({
  imports: [ConfigModule, IngestionModule, OtlpReceiverModule],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {
  constructor(private readonly config: AppConfig) {
    this.config.validate();
  }
}

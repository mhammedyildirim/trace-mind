import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppConfig } from './common/config/app.config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(AppConfig);
  const logger = new Logger('Bootstrap');

  // Enable CORS if needed
  app.enableCors();

  await app.listen(config.port);
  logger.log(`TraceMind service is running on port ${config.port}`);
}
void bootstrap();

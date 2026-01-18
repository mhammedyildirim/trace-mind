import { Injectable } from '@nestjs/common';

@Injectable()
export class AppConfig {
  readonly port: number;
  readonly logLevel: string;
  readonly geminiApiKey: string;
  readonly geminiModel: string;
  readonly maxAnalysisTimeoutMs: number;
  readonly minTraceDurationMs: number;

  constructor() {
    this.port = parseInt(process.env.PORT || '3000', 10);
    this.logLevel = process.env.LOG_LEVEL || 'info';
    this.geminiApiKey = process.env.GEMINI_API_KEY || '';
    this.geminiModel = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
    this.maxAnalysisTimeoutMs = parseInt(
      process.env.MAX_ANALYSIS_TIMEOUT_MS || '10000',
      10,
    );
    this.minTraceDurationMs = parseInt(
      process.env.MIN_TRACE_DURATION_MS || '50',
      10,
    );
  }

  validate(): void {
    // Skip validation in development mode (for local development)
    // Validation is required in production (Docker)
    const isDevelopment =
      process.env.NODE_ENV === 'development' ||
      process.env.NODE_ENV === undefined;

    if (isDevelopment) {
      // Allow running without API key in development
      return;
    }

    // Production validation (Docker) - strict check
    if (!this.geminiApiKey || this.geminiApiKey.trim() === '') {
      throw new Error(
        'GEMINI_API_KEY environment variable is required. ' +
          'Please set it in your .env file or as an environment variable. ' +
          'Get your API key from: https://makersuite.google.com/app/apikey',
      );
    }
  }
}

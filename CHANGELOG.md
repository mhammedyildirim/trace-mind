# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial release of TraceMind
- OpenTelemetry OTLP/HTTP JSON trace ingestion
- Automatic trace analysis using Google Gemini AI
- Root cause analysis with evidence, fixes, and risk identification
- Span tree building and dominant span detection
- Health check endpoint
- Docker support with multi-stage builds
- Docker Compose configuration with OpenTelemetry Collector

### Security
- Non-root user in Docker containers
- Environment variable validation for API keys
- .dockerignore excludes sensitive files

## [0.0.1] - 2026-01-18

### Added
- Initial public release
- Core trace analysis functionality
- Docker Hub image support
- Comprehensive documentation

[Unreleased]: https://github.com/YOUR_USERNAME/trace-mind/compare/v0.0.1...HEAD
[0.0.1]: https://github.com/YOUR_USERNAME/trace-mind/releases/tag/v0.0.1

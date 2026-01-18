# TraceMind

[![Docker Pulls](https://img.shields.io/docker/pulls/tracemind/tracemind.svg)](https://hub.docker.com/r/tracemind/tracemind)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**TraceMind** is a vendor-independent Agentic AI service that automatically analyzes OpenTelemetry traces and produces root-cause reports for slow or failing backend requests.

> 🚀 **Quick Start**: `docker run -d -p 3000:3000 -e GEMINI_API_KEY=your-key tracemind/tracemind:latest`

## Problem Statement

Engineers currently must manually inspect OpenTelemetry traces in tools (e.g., Jaeger, SigNoz, Tempo, ELK) to determine why backend requests are slow or failing. This is time-consuming, requires senior expertise, and delays incident response.

## Solution

TraceMind receives OpenTelemetry OTLP/HTTP JSON trace payloads directly from an OpenTelemetry Collector, normalizes the data, and uses Google Gemini AI to automatically generate:

- **Root cause summary** - Concise explanation of the performance issue
- **Supporting evidence** - Key observations from the trace
- **Suggested fixes** - Actionable recommendations
- **Potential risks** - Identified issues that could lead to incidents

## Features

- ✅ **Vendor-independent** - Works with any OpenTelemetry-compatible system
- ✅ **Stateless** - No database required, perfect for serverless/container deployments
- ✅ **Real-time analysis** - Immediate JSON response with root-cause analysis
- ✅ **Automatic span classification** - Identifies database, HTTP, messaging, and internal operations
- ✅ **Dominant span detection** - Automatically finds the longest span (primary suspect)

## Architecture

```
OpenTelemetry Collector → TraceMind → Google Gemini → Analysis Report
```

1. **Ingestion**: Receives OTLP/HTTP JSON traces via `POST /v1/traces`
2. **Normalization**: Converts OTLP format to internal normalized model
3. **Analysis**: Builds span tree, identifies dominant span, analyzes with Gemini
4. **Response**: Returns structured JSON report with root cause and recommendations

## 🚀 Quick Start with Docker

The fastest way to get started is using the pre-built Docker image from Docker Hub.

### Prerequisites

- Docker installed
- Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

### Option 1: Docker Run (Recommended)

```bash
# Run TraceMind container
docker run -d \
  --name tracemind \
  -p 3000:3000 \
  -e GEMINI_API_KEY=your-gemini-api-key-here \
  tracemind/tracemind:latest

# Verify it's running
curl http://localhost:3000/health
```

### Option 2: Docker Compose

**Step 1:** Create a `.env` file in the project root:

```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your actual GEMINI_API_KEY
# GEMINI_API_KEY=your-actual-api-key-here
```

**Step 2:** Use the provided `docker-compose.yml` or create your own:

```yaml
version: '3.8'

services:
  tracemind:
    image: tracemind/tracemind:latest
    ports:
      - "3000:3000"
    env_file:
      - .env
    environment:
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - PORT=3000
      - LOG_LEVEL=info
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"]
      interval: 30s
      timeout: 3s
      retries: 3
```

**Step 3:** Start the service:

```bash
# Start the service (docker-compose automatically reads .env file)
docker-compose up -d

# View logs
docker-compose logs -f tracemind
```

**Alternative:** You can also set the environment variable directly:

```bash
# Set your API key as environment variable
export GEMINI_API_KEY=your-gemini-api-key-here

# Start the service
docker-compose up -d
```

### Option 3: Using Environment File

Create a `.env` file:

```bash
GEMINI_API_KEY=your-gemini-api-key-here
PORT=3000
LOG_LEVEL=info
GEMINI_MODEL=gemini-2.0-flash
```

Then run:

```bash
docker run -d \
  --name tracemind \
  -p 3000:3000 \
  --env-file .env \
  tracemind/tracemind:latest
```

### Test the Installation

Send a test trace to verify everything works:

```bash
# Check health
curl http://localhost:3000/health

# Send a test trace (if you have sample-trace.json)
curl -X POST http://localhost:3000/v1/traces \
  -H "Content-Type: application/json" \
  -d @examples/sample-trace.json
```

## 📦 Available Docker Tags

- `latest` - Latest stable release
- `v0.0.1` - Specific version tag
- `alpine` - Alpine-based image (smaller size)

## 🔧 Local Development

1. **Clone and setup**
   ```bash
   git clone <repo-url>
   cd trace-mind
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env and add your GEMINI_API_KEY
   ```

3. **Start services**
   ```bash
   docker-compose up -d
   ```

4. **Verify service is running**
   ```bash
   curl http://localhost:3000/health
   ```

5. **Send test trace**
   ```bash
   curl -X POST http://localhost:4318/v1/traces \
     -H "Content-Type: application/json" \
     -d @examples/sample-trace.json
   ```

   Or send directly to TraceMind:
   ```bash
   curl -X POST http://localhost:3000/v1/traces \
     -H "Content-Type: application/json" \
     -d @examples/sample-trace.json
   ```

6. **View logs**
   ```bash
   docker-compose logs -f tracemind
   ```

## 🔒 Security Best Practices

**Important Security Notes:**
- ⚠️ **Never commit API keys** to version control
- ⚠️ **Never hardcode API keys** in Docker images or Dockerfiles
- ✅ Always provide `GEMINI_API_KEY` as an environment variable at runtime
- ✅ Use Docker secrets or environment files for production deployments
- ✅ Use Docker secrets in Docker Swarm or Kubernetes secrets in K8s
- ✅ Rotate API keys regularly
- ✅ Use least-privilege IAM roles for production API keys

**Environment Variables:**

All configuration is done via environment variables:

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `GEMINI_API_KEY` | Google Gemini API key | - | **Yes** |
| `PORT` | Server port | `3000` | No |
| `LOG_LEVEL` | Logging level | `info` | No |
| `GEMINI_MODEL` | Gemini model to use | `gemini-2.0-flash` | No |
| `MAX_ANALYSIS_TIMEOUT_MS` | Max analysis timeout | `10000` | No |
| `MIN_TRACE_DURATION_MS` | Skip analysis for fast traces | `50` | No |

### Running Without Docker

```bash
# Install dependencies
npm install

# Set environment variables
export GEMINI_API_KEY=your-api-key-here

# Start in development mode
npm run start:dev
```

## API Reference

### POST /v1/traces

Receives OpenTelemetry OTLP/HTTP JSON trace payloads and returns analysis.

**Request**: OTLP/HTTP JSON format (see `examples/sample-trace.json`)

**Response** (200 OK):
```json
{
  "traceId": "4bf92f3577b34da6a3ce929d0e0e4736",
  "totalDuration": 1250,
  "dominantSpan": {
    "spanId": "90f067aa0ba902b8",
    "operationName": "SELECT users",
    "duration": 980,
    "spanType": "database",
    "percentageOfTotal": 78.4
  },
  "rootCause": "The request was slow due to a database query...",
  "evidence": [
    "Database query span took 980ms out of 1250ms total (78.4%)",
    "No error status detected, but duration exceeds threshold"
  ],
  "suggestedFixes": [
    "Add database index on users.id column",
    "Consider query result caching"
  ],
  "risks": [
    "Potential cascading failure if database latency increases"
  ]
}
```

**Error Responses**:
- `400 Bad Request` - Invalid payload format
- `500 Internal Server Error` - Analysis failure
- `503 Service Unavailable` - Gemini API unavailable

### GET /health

Health check endpoint.

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Configuration

Environment variables (see `.env.example`):

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `LOG_LEVEL` | Logging level | `info` |
| `GEMINI_API_KEY` | Google Gemini API key | **Required** |
| `GEMINI_MODEL` | Gemini model to use | `gemini-2.0-flash` |
| `MAX_ANALYSIS_TIMEOUT_MS` | Max analysis timeout | `10000` |
| `MIN_TRACE_DURATION_MS` | Skip analysis for fast traces | `50` |

## OpenTelemetry Collector Configuration

Configure your Collector to forward traces to TraceMind:

```yaml
receivers:
  otlp:
    protocols:
      http:
        endpoint: 0.0.0.0:4318

exporters:
  otlphttp:
    endpoint: http://tracemind:3000/v1/traces
    headers:
      Content-Type: application/json
    tls:
      insecure: true

service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [otlphttp]
```

## Project Structure

```
trace-mind/
├── src/
│   ├── ingestion/          # Trace ingestion module
│   ├── normalization/       # OTLP normalization
│   ├── analysis/           # Analysis orchestration & Gemini integration
│   ├── common/             # Shared types and config
│   └── dto/                # Data transfer objects
├── docker/                 # Docker configuration
├── examples/               # Example trace payloads
└── docker-compose.yml     # Local development setup
```

## Development

```bash
# Install dependencies
npm install

# Run in development mode (watch)
npm run start:dev

# Build for production
npm run build

# Run production build
npm run start:prod

# Run tests
npm run test

# Run e2e tests
npm run test:e2e

# Lint code
npm run lint
```

## 🐳 Docker Hub Publishing (Maintainers)

To publish a new version to Docker Hub:

```bash
# Build the image (Docker Hub uses root Dockerfile by default)
docker build -t tracemind/tracemind:latest .

# Or use docker/Dockerfile explicitly
docker build -f docker/Dockerfile -t tracemind/tracemind:latest .

# Tag with version
docker tag tracemind/tracemind:latest tracemind/tracemind:v0.0.1

# Login to Docker Hub
docker login

# Push to Docker Hub
docker push tracemind/tracemind:latest
docker push tracemind/tracemind:v0.0.1
```

**Note:** Update `package.json` repository URL with your actual GitHub repository before publishing.

**Pre-Publishing Security Checklist:**
- ✅ Verify `.dockerignore` excludes `.env` files and secrets
- ✅ Verify no API keys or secrets in Dockerfile or source code
- ✅ Verify image runs with runtime environment variables only
- ✅ Test image: `docker run -e GEMINI_API_KEY=test-key tracemind/tracemind:latest`
- ✅ Verify health check works: `curl http://localhost:3000/health`
- ✅ Test with sample trace payload
- ✅ Check image size: `docker images tracemind/tracemind`

**Docker Hub Repository Setup:**
1. Create repository on Docker Hub: `tracemind/tracemind`
2. Add description and documentation
3. Set up automated builds (optional)
4. Configure visibility (public for open source)

## License

MIT

## 🐛 Troubleshooting

### Container won't start

**Check logs:**
```bash
docker logs tracemind
```

**Common issues:**
- Missing `GEMINI_API_KEY` environment variable
- Port 3000 already in use (change with `-p 8080:3000`)
- Invalid API key format

### Health check failing

```bash
# Test health endpoint manually
curl http://localhost:3000/health

# Check container status
docker ps -a | grep tracemind
```

### API returns 503 Service Unavailable

- Verify Gemini API key is valid
- Check network connectivity from container
- Review logs for API errors: `docker logs tracemind`

### Performance Issues

- Increase `MAX_ANALYSIS_TIMEOUT_MS` for complex traces
- Adjust `MIN_TRACE_DURATION_MS` to filter out fast traces
- Monitor container resources: `docker stats tracemind`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [NestJS](https://nestjs.com/)
- Powered by [Google Gemini AI](https://ai.google.dev/)
- Compatible with [OpenTelemetry](https://opentelemetry.io/)

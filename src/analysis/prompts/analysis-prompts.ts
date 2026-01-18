import {
  NormalizedTrace,
  NormalizedSpan,
} from '../../normalization/models/trace.model';
import { SpanTree } from '../services/span-tree-builder.service';

export const SYSTEM_PROMPT = `You are an expert distributed systems engineer analyzing OpenTelemetry traces to identify root causes of slow or failing backend requests.

Your task is to analyze a trace and produce a concise, actionable root-cause report.

Guidelines:
- Base conclusions ONLY on evidence present in the trace data
- If information is missing, explicitly state uncertainty
- Do NOT claim actions were executed - this is analysis only
- Focus on the dominant span (longest duration) as the primary suspect for performance issues
- Identify span types (database, HTTP, messaging, internal) to understand the operation context
- Look for patterns: retries, timeouts, cascading failures, sequential bottlenecks
- Provide specific, actionable suggestions that engineers can implement
- Highlight risks that could lead to incidents or outages

Output format: You MUST respond with valid JSON only, no markdown, no code blocks. Use this exact structure:
{
  "rootCause": "string - 2-3 sentence explanation of the likely root cause",
  "evidence": ["string array - 3-5 supporting evidence points from the trace"],
  "suggestedFixes": ["string array - 3-5 actionable recommendations"],
  "risks": ["string array - 2-4 potential issues or risks identified"]
}`;

export function buildUserPrompt(
  trace: NormalizedTrace,
  dominantSpan: NormalizedSpan,
  spanTree: SpanTree,
  spanTypeDistribution: Record<string, number>,
): string {
  const spansByDuration = [...trace.spans].sort(
    (a, b) => b.duration - a.duration,
  );
  const topSpans = spansByDuration.slice(0, 10); // Top 10 longest spans

  const spanTypeDistStr = Object.entries(spanTypeDistribution)
    .map(([type, count]) => `${type}: ${count}`)
    .join(', ');

  return `Analyze the following OpenTelemetry trace:

Trace ID: ${trace.traceId}
Service: ${trace.serviceName}
Total Duration: ${trace.totalDuration}ms
Start Time: ${new Date(trace.startTime).toISOString()}
End Time: ${new Date(trace.endTime).toISOString()}

Dominant Span (longest duration - primary suspect):
- Span ID: ${dominantSpan.spanId}
- Operation: ${dominantSpan.operationName}
- Duration: ${dominantSpan.duration}ms (${((dominantSpan.duration / trace.totalDuration) * 100).toFixed(1)}% of total)
- Type: ${dominantSpan.spanType}
- Status: ${dominantSpan.status}
- Attributes: ${JSON.stringify(dominantSpan.attributes, null, 2)}

Top Spans by Duration:
${topSpans
  .map(
    (span, idx) =>
      `${idx + 1}. ${span.operationName} (${span.spanType}) - ${span.duration}ms (${((span.duration / trace.totalDuration) * 100).toFixed(1)}%) - Status: ${span.status}`,
  )
  .join('\n')}

Total Spans: ${trace.spans.length}
Span Types Distribution: ${spanTypeDistStr}

Please provide a root-cause analysis report in the specified JSON format. Focus on the dominant span and explain why it's likely causing the performance issue.`;
}

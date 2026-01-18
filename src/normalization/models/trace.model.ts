export type SpanType = 'database' | 'http' | 'messaging' | 'internal';
export type SpanStatus = 'ok' | 'error' | 'unset';

export interface NormalizedSpan {
  spanId: string;
  parentSpanId?: string;
  operationName: string;
  spanType: SpanType;
  startTime: number; // Unix timestamp (ms)
  endTime: number;
  duration: number; // ms
  status: SpanStatus;
  attributes: Record<string, any>;
  children?: NormalizedSpan[]; // Child spans in hierarchy
}

export interface NormalizedTrace {
  traceId: string;
  serviceName: string;
  startTime: number; // Unix timestamp (ms)
  endTime: number;
  totalDuration: number; // ms
  spans: NormalizedSpan[];
}

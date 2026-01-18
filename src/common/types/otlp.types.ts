export interface OtlpAttributeValue {
  stringValue?: string;
  intValue?: string;
  doubleValue?: number;
  boolValue?: boolean;
  bytesValue?: string;
  arrayValue?: {
    values: OtlpAttributeValue[];
  };
  kvlistValue?: {
    values: OtlpKeyValue[];
  };
}

export interface OtlpKeyValue {
  key: string;
  value: OtlpAttributeValue;
}

export interface OtlpResource {
  attributes: OtlpKeyValue[];
  droppedAttributesCount?: number;
}

export interface OtlpSpan {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  name: string;
  kind: number; // SpanKind enum
  startTimeUnixNano: string;
  endTimeUnixNano?: string;
  attributes?: OtlpKeyValue[];
  status?: {
    code?: number; // StatusCode enum (0=UNSET, 1=OK, 2=ERROR)
    message?: string;
  };
  events?: OtlpEvent[];
  links?: OtlpLink[];
  droppedAttributesCount?: number;
  droppedEventsCount?: number;
  droppedLinksCount?: number;
}

export interface OtlpEvent {
  timeUnixNano: string;
  name: string;
  attributes?: OtlpKeyValue[];
  droppedAttributesCount?: number;
}

export interface OtlpLink {
  traceId: string;
  spanId: string;
  attributes?: OtlpKeyValue[];
  droppedAttributesCount?: number;
}

export interface OtlpScopeSpan {
  scope?: {
    name?: string;
    version?: string;
    attributes?: OtlpKeyValue[];
    droppedAttributesCount?: number;
  };
  spans: OtlpSpan[];
}

export interface OtlpResourceSpan {
  resource: OtlpResource;
  scopeSpans: OtlpScopeSpan[];
  schemaUrl?: string;
}

export interface OtlpTracePayload {
  resourceSpans: OtlpResourceSpan[];
}

import { Injectable } from '@nestjs/common';
import {
  OtlpTracePayload,
  OtlpSpan,
  OtlpKeyValue,
} from '../../common/types/otlp.types';
import {
  NormalizedTrace,
  NormalizedSpan,
  SpanType,
  SpanStatus,
} from '../models/trace.model';

@Injectable()
export class NormalizerService {
  normalize(otlpPayload: OtlpTracePayload): NormalizedTrace {
    if (!otlpPayload.resourceSpans || otlpPayload.resourceSpans.length === 0) {
      throw new Error('Invalid OTLP payload: no resourceSpans found');
    }

    const resourceSpan = otlpPayload.resourceSpans[0];
    const serviceName = this.extractServiceName(resourceSpan.resource);
    const spans: NormalizedSpan[] = [];

    for (const scopeSpan of resourceSpan.scopeSpans) {
      for (const span of scopeSpan.spans) {
        const normalizedSpan = this.normalizeSpan(span);
        spans.push(normalizedSpan);
      }
    }

    if (spans.length === 0) {
      throw new Error('Invalid OTLP payload: no spans found');
    }

    const traceId = this.extractTraceId(otlpPayload);

    const startTime = Math.min(...spans.map((s) => s.startTime));
    const endTime = Math.max(...spans.map((s) => s.endTime));
    const totalDuration = endTime - startTime;

    return {
      traceId,
      serviceName,
      startTime,
      endTime,
      totalDuration,
      spans,
    };
  }

  private extractTraceId(payload: OtlpTracePayload): string {
    for (const resourceSpan of payload.resourceSpans) {
      for (const scopeSpan of resourceSpan.scopeSpans) {
        for (const span of scopeSpan.spans) {
          if (span.traceId) {
            return span.traceId;
          }
        }
      }
    }
    throw new Error('TraceId not found in OTLP payload');
  }

  private extractServiceName(resource: {
    attributes?: OtlpKeyValue[];
  }): string {
    if (!resource.attributes) {
      return 'unknown-service';
    }

    for (const attr of resource.attributes) {
      if (attr.key === 'service.name' && attr.value.stringValue) {
        return attr.value.stringValue;
      }
    }

    return 'unknown-service';
  }

  private normalizeSpan(span: OtlpSpan): NormalizedSpan {
    const startTime = this.nanoToMs(span.startTimeUnixNano);
    const endTime = span.endTimeUnixNano
      ? this.nanoToMs(span.endTimeUnixNano)
      : startTime;
    const duration = endTime - startTime;

    const attributes = this.extractAttributes(span.attributes || []);
    const spanType = this.classifySpanType(span, attributes);
    const status = this.normalizeStatus(span.status);

    return {
      spanId: span.spanId,
      parentSpanId: span.parentSpanId,
      operationName: span.name,
      spanType,
      startTime,
      endTime,
      duration,
      status,
      attributes,
    };
  }

  private nanoToMs(nano: string): number {
    return parseInt(nano, 10) / 1_000_000;
  }

  private extractAttributes(
    otlpAttributes: OtlpKeyValue[],
  ): Record<string, any> {
    const attributes: Record<string, any> = {};

    for (const attr of otlpAttributes) {
      if (attr.value.stringValue !== undefined) {
        attributes[attr.key] = attr.value.stringValue;
      } else if (attr.value.intValue !== undefined) {
        attributes[attr.key] = parseInt(attr.value.intValue, 10);
      } else if (attr.value.doubleValue !== undefined) {
        attributes[attr.key] = attr.value.doubleValue;
      } else if (attr.value.boolValue !== undefined) {
        attributes[attr.key] = attr.value.boolValue;
      }
    }

    return attributes;
  }

  private classifySpanType(
    span: OtlpSpan,
    attributes: Record<string, any>,
  ): SpanType {
    if (
      attributes['db.system'] ||
      attributes['db.statement'] ||
      attributes['db.operation'] ||
      span.name.toLowerCase().includes('select') ||
      span.name.toLowerCase().includes('insert') ||
      span.name.toLowerCase().includes('update') ||
      span.name.toLowerCase().includes('delete') ||
      span.name.toLowerCase().includes('query')
    ) {
      return 'database';
    }

    if (
      attributes['http.method'] ||
      attributes['http.url'] ||
      attributes['http.route'] ||
      attributes['http.status_code'] ||
      span.name.toLowerCase().startsWith('http') ||
      span.name.toLowerCase().startsWith('get ') ||
      span.name.toLowerCase().startsWith('post ') ||
      span.name.toLowerCase().startsWith('put ') ||
      span.name.toLowerCase().startsWith('delete ')
    ) {
      return 'http';
    }

    if (
      attributes['messaging.system'] ||
      attributes['messaging.operation'] ||
      attributes['messaging.destination'] ||
      span.name.toLowerCase().includes('publish') ||
      span.name.toLowerCase().includes('subscribe') ||
      span.name.toLowerCase().includes('consume') ||
      span.name.toLowerCase().includes('send') ||
      span.name.toLowerCase().includes('receive')
    ) {
      return 'messaging';
    }

    return 'internal';
  }

  private normalizeStatus(status?: {
    code?: number;
    message?: string;
  }): SpanStatus {
    if (!status || status.code === undefined) {
      return 'unset';
    }

    if (status.code === 1) {
      return 'ok';
    }
    if (status.code === 2) {
      return 'error';
    }

    return 'unset';
  }
}

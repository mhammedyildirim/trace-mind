import { Injectable } from '@nestjs/common';
import { NormalizedSpan } from '../../normalization/models/trace.model';

export interface SpanTree {
  spans: NormalizedSpan[];
  dominantSpan: NormalizedSpan;
  totalDuration: number;
}

@Injectable()
export class SpanTreeBuilderService {
  buildSpanTree(spans: NormalizedSpan[]): SpanTree {
    if (spans.length === 0) {
      throw new Error('Cannot build span tree: no spans provided');
    }

    const spansWithChildren = this.buildSpanHierarchy(spans);

    const totalDuration = this.calculateTotalDuration(spans);
    const dominantSpan = this.findDominantSpan(spans);

    return {
      spans: spansWithChildren,
      dominantSpan,
      totalDuration,
    };
  }

  private buildSpanHierarchy(spans: NormalizedSpan[]): NormalizedSpan[] {
    const spanMap = new Map<
      string,
      NormalizedSpan & { children?: NormalizedSpan[] }
    >();

    const spansWithChildren = spans.map((span) => ({
      ...span,
      children: [] as NormalizedSpan[],
    }));

    for (const span of spansWithChildren) {
      spanMap.set(span.spanId, span);
    }

    for (const span of spansWithChildren) {
      if (span.parentSpanId) {
        const parent = spanMap.get(span.parentSpanId);
        if (parent && parent.children) {
          parent.children.push(span);
        }
      }
    }

    return spansWithChildren;
  }

  findDominantSpan(spans: NormalizedSpan[]): NormalizedSpan {
    if (spans.length === 0) {
      throw new Error('Cannot find dominant span: no spans provided');
    }

    return spans.reduce((max, span) =>
      span.duration > max.duration ? span : max,
    );
  }

  private calculateTotalDuration(spans: NormalizedSpan[]): number {
    if (spans.length === 0) {
      return 0;
    }

    const startTime = Math.min(...spans.map((s) => s.startTime));
    const endTime = Math.max(...spans.map((s) => s.endTime));
    return endTime - startTime;
  }

  getSpanTypeDistribution(spans: NormalizedSpan[]): Record<string, number> {
    const distribution: Record<string, number> = {};

    for (const span of spans) {
      distribution[span.spanType] = (distribution[span.spanType] || 0) + 1;
    }

    return distribution;
  }
}

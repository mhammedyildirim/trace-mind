import { IsString, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class DominantSpanDto {
  @IsString()
  spanId: string;

  @IsString()
  operationName: string;

  @IsNumber()
  duration: number;

  @IsString()
  spanType: string;

  @IsNumber()
  percentageOfTotal: number;
}

export class AnalysisResponseDto {
  @IsString()
  traceId: string;

  @IsNumber()
  totalDuration: number;

  @ValidateNested()
  @Type(() => DominantSpanDto)
  dominantSpan: DominantSpanDto;

  @IsString()
  rootCause: string;

  @IsArray()
  @IsString({ each: true })
  evidence: string[];

  @IsArray()
  @IsString({ each: true })
  suggestedFixes: string[];

  @IsArray()
  @IsString({ each: true })
  risks: string[];
}

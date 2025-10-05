import { IsString, IsNumber, IsUUID, IsDate, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class KafkaMessageDto {
  @IsString()
  topic: string;

  @IsString()
  key: string;

  @ValidateNested()
  @Type(() => Object)
  value: any;

  @Type(() => Date)
  timestamp?: Date;
}

export class PriceUpdateMessageDto {
  @IsUUID()
  tokenId: string;

  @IsString()
  symbol: string;

  @IsNumber()
  oldPrice: number;

  @IsNumber()
  newPrice: number;

  @Type(() => Date)
  timestamp: Date;
}
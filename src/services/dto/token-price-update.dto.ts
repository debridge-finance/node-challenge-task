import { IsUUID, IsNumber, IsPositive } from 'class-validator';

export class TokenPriceResponseDto {
  @IsUUID()
  id: string;

  @IsNumber()
  @IsPositive()
  price: number;

  timestamp: Date;
  lastPriceUpdate: Date;
}
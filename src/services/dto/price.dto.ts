import { IsNumber, IsPositive, IsUUID, IsString } from 'class-validator';

export class PriceRequestDto {
  @IsUUID()
  tokenId: string;

  @IsString()
  symbol: string;
}

export class PriceResponseDto {
  @IsUUID()
  tokenId: string;

  @IsNumber()
  @IsPositive()
  price: number;
}
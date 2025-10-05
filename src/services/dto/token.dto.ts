import { IsString, IsUUID, IsBoolean, IsNumber, IsOptional, Min, Max, Matches } from 'class-validator';
import { Type } from 'class-transformer';

export class TokenDto {
  @IsUUID()
  id: string;

  @IsString()
  @Matches(/^0x[a-fA-F0-9]{40}$/, { message: 'Address must be a valid Ethereum address' })
  address: string;

  @IsString()
  @IsOptional()
  symbol?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @Min(0)
  @Max(18)
  decimals: number;

  @IsBoolean()
  isNative: boolean;

  @IsUUID()
  chainId: string;

  @IsBoolean()
  isProtected: boolean;

  @IsString()
  @IsOptional()
  lastUpdateAuthor?: string;

  @IsNumber()
  @Min(0)
  priority: number;

  @Type(() => Date)
  timestamp: Date;

  @IsNumber()
  @Min(0)
  price: number;

  @Type(() => Date)
  lastPriceUpdate: Date;
}

export class CreateTokenDto {
  @IsString()
  @Matches(/^0x[a-fA-F0-9]{40}$/, { message: 'Address must be a valid Ethereum address' })
  address: string;

  @IsString()
  @IsOptional()
  symbol?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @Min(0)
  @Max(18)
  decimals: number;

  @IsBoolean()
  isNative: boolean;

  @IsUUID()
  chainId: string;

  @IsBoolean()
  @IsOptional()
  isProtected?: boolean;

  @IsNumber()
  @Min(0)
  @IsOptional()
  priority?: number;
}

export class UpdateTokenDto {
  @IsString()
  @IsOptional()
  symbol?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsBoolean()
  @IsOptional()
  isProtected?: boolean;

  @IsNumber()
  @Min(0)
  @IsOptional()
  priority?: number;

  @IsString()
  @IsOptional()
  lastUpdateAuthor?: string;
}
import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Token } from '../../models/token.entity';
import { TokenDto, CreateTokenDto, UpdateTokenDto } from './token.dto';

@Injectable()
export class TokenMapper {
  toDto(entity: Token): TokenDto {
    return plainToInstance(TokenDto, entity, { excludeExtraneousValues: false });
  }

  toDtoArray(entities: Token[]): TokenDto[] {
    return entities.map(entity => this.toDto(entity));
  }

  toEntity(dto: CreateTokenDto): Token {
    const entity = new Token();
    entity.address = dto.address;
    entity.symbol = dto.symbol;
    entity.name = dto.name;
    entity.decimals = dto.decimals;
    entity.isNative = dto.isNative;
    entity.chainId = dto.chainId;
    entity.isProtected = dto.isProtected || false;
    entity.priority = dto.priority || 0;
    entity.price = 0;
    entity.lastPriceUpdate = new Date();
    entity.timestamp = new Date();
    return entity;
  }

  updateEntity(entity: Token, dto: UpdateTokenDto): Token {
    if (dto.symbol !== undefined) entity.symbol = dto.symbol;
    if (dto.name !== undefined) entity.name = dto.name;
    if (dto.isProtected !== undefined) entity.isProtected = dto.isProtected;
    if (dto.priority !== undefined) entity.priority = dto.priority;
    if (dto.lastUpdateAuthor !== undefined) entity.lastUpdateAuthor = dto.lastUpdateAuthor;
    return entity;
  }
}
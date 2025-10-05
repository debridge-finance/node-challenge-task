import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Token } from '../models/token.entity';
import { TokenDto, CreateTokenDto, UpdateTokenDto } from './dto/token.dto';
import { TokenMapper } from './dto/token.mapper';
import { validateOrReject } from 'class-validator';

@Injectable()
export class TokenService {
  constructor(
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
    private readonly tokenMapper: TokenMapper,
  ) {}

  async findAll(): Promise<TokenDto[]> {
    const tokens = await this.tokenRepository.find({
      relations: ['chain', 'logo'],
    });
    return this.tokenMapper.toDtoArray(tokens);
  }

  async findOne(id: string): Promise<TokenDto> {
    const token = await this.tokenRepository.findOne({
      where: { id },
      relations: ['chain', 'logo'],
    });
    
    if (!token) {
      throw new NotFoundException(`Token with ID ${id} not found`);
    }
    
    return this.tokenMapper.toDto(token);
  }

  async findByAddress(address: string, chainId: string): Promise<TokenDto | null> {
    const token = await this.tokenRepository.findOne({
      where: { address, chainId },
      relations: ['chain', 'logo'],
    });
    
    return token ? this.tokenMapper.toDto(token) : null;
  }

  async create(createTokenDto: CreateTokenDto): Promise<TokenDto> {
    // Validate DTO
    await validateOrReject(createTokenDto);
    
    // Check if token already exists
    const existing = await this.findByAddress(createTokenDto.address, createTokenDto.chainId);
    if (existing) {
      throw new Error(`Token ${createTokenDto.address} already exists on chain ${createTokenDto.chainId}`);
    }
    
    // Convert DTO to entity
    const token = this.tokenMapper.toEntity(createTokenDto);
    
    // Save to database
    const savedToken = await this.tokenRepository.save(token);
    
    // Return as DTO
    return this.tokenMapper.toDto(savedToken);
  }

  async update(id: string, updateTokenDto: UpdateTokenDto): Promise<TokenDto> {
    // Validate DTO
    await validateOrReject(updateTokenDto);
    
    // Find existing token
    const token = await this.tokenRepository.findOne({
      where: { id },
      relations: ['chain', 'logo'],
    });
    
    if (!token) {
      throw new NotFoundException(`Token with ID ${id} not found`);
    }
    
    // Update entity with DTO data
    const updatedToken = this.tokenMapper.updateEntity(token, updateTokenDto);
    
    // Save to database
    const savedToken = await this.tokenRepository.save(updatedToken);
    
    // Return as DTO
    return this.tokenMapper.toDto(savedToken);
  }

  async updatePrice(id: string, price: number): Promise<TokenDto> {
    const token = await this.tokenRepository.findOne({
      where: { id },
      relations: ['chain', 'logo'],
    });
    
    if (!token) {
      throw new NotFoundException(`Token with ID ${id} not found`);
    }
    
    token.price = price;
    token.lastPriceUpdate = new Date();
    
    const savedToken = await this.tokenRepository.save(token);
    return this.tokenMapper.toDto(savedToken);
  }

  async delete(id: string): Promise<void> {
    const result = await this.tokenRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Token with ID ${id} not found`);
    }
  }
}
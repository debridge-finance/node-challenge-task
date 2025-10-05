import { Test, TestingModule } from '@nestjs/testing';
import { TokenMapper } from './token.mapper';
import { Token } from '../../models/token.entity';
import { CreateTokenDto, UpdateTokenDto } from './token.dto';

describe('TokenMapper', () => {
  let mapper: TokenMapper;

  const mockToken: Token = {
    id: 'test-id',
    address: '0x1234567890123456789012345678901234567890',
    symbol: 'TEST',
    name: 'Test Token',
    decimals: 18,
    isNative: false,
    chainId: 'chain-id',
    chain: null,
    logo: null,
    isProtected: false,
    lastUpdateAuthor: null,
    priority: 0,
    timestamp: new Date('2024-01-01'),
    price: 100,
    lastPriceUpdate: new Date('2024-01-01'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TokenMapper],
    }).compile();

    mapper = module.get<TokenMapper>(TokenMapper);
  });

  describe('toDto', () => {
    it('should convert entity to DTO', () => {
      const dto = mapper.toDto(mockToken);

      expect(dto).toBeDefined();
      expect(dto.id).toBe(mockToken.id);
      expect(dto.address).toBe(mockToken.address);
      expect(dto.symbol).toBe(mockToken.symbol);
      expect(dto.name).toBe(mockToken.name);
      expect(dto.decimals).toBe(mockToken.decimals);
      expect(dto.isNative).toBe(mockToken.isNative);
      expect(dto.chainId).toBe(mockToken.chainId);
      expect(dto.isProtected).toBe(mockToken.isProtected);
      expect(dto.priority).toBe(mockToken.priority);
      expect(dto.price).toBe(mockToken.price);
    });

    it('should handle null values', () => {
      const tokenWithNulls: Token = {
        ...mockToken,
        symbol: null,
        name: null,
        lastUpdateAuthor: null,
      };

      const dto = mapper.toDto(tokenWithNulls);

      expect(dto.symbol).toBeNull();
      expect(dto.name).toBeNull();
      expect(dto.lastUpdateAuthor).toBeNull();
    });
  });

  describe('toDtoArray', () => {
    it('should convert array of entities to array of DTOs', () => {
      const tokens = [
        mockToken,
        { ...mockToken, id: 'test-id-2', symbol: 'TEST2' },
        { ...mockToken, id: 'test-id-3', symbol: 'TEST3' },
      ];

      const dtos = mapper.toDtoArray(tokens);

      expect(dtos).toHaveLength(3);
      expect(dtos[0].id).toBe('test-id');
      expect(dtos[1].id).toBe('test-id-2');
      expect(dtos[2].id).toBe('test-id-3');
      expect(dtos[1].symbol).toBe('TEST2');
      expect(dtos[2].symbol).toBe('TEST3');
    });

    it('should handle empty array', () => {
      const dtos = mapper.toDtoArray([]);

      expect(dtos).toEqual([]);
    });
  });

  describe('toEntity', () => {
    it('should create entity from CreateTokenDto', () => {
      const createDto: CreateTokenDto = {
        address: '0xabcdef1234567890123456789012345678901234',
        symbol: 'NEW',
        name: 'New Token',
        decimals: 8,
        isNative: true,
        chainId: 'new-chain-id',
      };

      const entity = mapper.toEntity(createDto);

      expect(entity).toBeInstanceOf(Token);
      expect(entity.address).toBe(createDto.address);
      expect(entity.symbol).toBe(createDto.symbol);
      expect(entity.name).toBe(createDto.name);
      expect(entity.decimals).toBe(createDto.decimals);
      expect(entity.isNative).toBe(createDto.isNative);
      expect(entity.chainId).toBe(createDto.chainId);
      expect(entity.price).toBe(0);
      expect(entity.isProtected).toBe(false);
      expect(entity.priority).toBe(0);
      expect(entity.lastPriceUpdate).toBeInstanceOf(Date);
      expect(entity.timestamp).toBeInstanceOf(Date);
    });

    it('should handle optional fields in CreateTokenDto', () => {
      const createDto: CreateTokenDto = {
        address: '0xabcdef1234567890123456789012345678901234',
        decimals: 18,
        isNative: false,
        chainId: 'chain-id',
        isProtected: true,
        priority: 5,
      };

      const entity = mapper.toEntity(createDto);

      expect(entity.symbol).toBeUndefined();
      expect(entity.name).toBeUndefined();
      expect(entity.isProtected).toBe(true);
      expect(entity.priority).toBe(5);
    });
  });

  describe('updateEntity', () => {
    it('should update entity with UpdateTokenDto', () => {
      const updateDto: UpdateTokenDto = {
        symbol: 'UPDATED',
        name: 'Updated Token',
        isProtected: true,
        priority: 10,
        lastUpdateAuthor: 'admin',
      };

      const entity = { ...mockToken };
      const updatedEntity = mapper.updateEntity(entity, updateDto);

      expect(updatedEntity.symbol).toBe('UPDATED');
      expect(updatedEntity.name).toBe('Updated Token');
      expect(updatedEntity.isProtected).toBe(true);
      expect(updatedEntity.priority).toBe(10);
      expect(updatedEntity.lastUpdateAuthor).toBe('admin');
      // Unchanged fields
      expect(updatedEntity.address).toBe(mockToken.address);
      expect(updatedEntity.decimals).toBe(mockToken.decimals);
    });

    it('should only update provided fields', () => {
      const updateDto: UpdateTokenDto = {
        symbol: 'PARTIAL',
      };

      const entity = { ...mockToken };
      const updatedEntity = mapper.updateEntity(entity, updateDto);

      expect(updatedEntity.symbol).toBe('PARTIAL');
      // All other fields unchanged
      expect(updatedEntity.name).toBe(mockToken.name);
      expect(updatedEntity.isProtected).toBe(mockToken.isProtected);
      expect(updatedEntity.priority).toBe(mockToken.priority);
      expect(updatedEntity.lastUpdateAuthor).toBe(mockToken.lastUpdateAuthor);
    });

    it('should handle empty UpdateTokenDto', () => {
      const updateDto: UpdateTokenDto = {};

      const entity = { ...mockToken };
      const updatedEntity = mapper.updateEntity(entity, updateDto);

      // All fields should remain unchanged
      expect(updatedEntity).toEqual(entity);
    });

    it('should update fields to undefined when explicitly set', () => {
      const updateDto: UpdateTokenDto = {
        symbol: undefined,
        name: undefined,
      };

      const entity = { ...mockToken };
      const updatedEntity = mapper.updateEntity(entity, updateDto);

      // Fields not updated when undefined
      expect(updatedEntity.symbol).toBe(mockToken.symbol);
      expect(updatedEntity.name).toBe(mockToken.name);
    });
  });
});
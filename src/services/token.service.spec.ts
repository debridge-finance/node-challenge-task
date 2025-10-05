import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TokenService } from './token.service';
import { Token } from '../models/token.entity';
import { TokenMapper } from './dto/token.mapper';
import { CreateTokenDto, UpdateTokenDto } from './dto/token.dto';
import { NotFoundException } from '@nestjs/common';

// Mock class-validator at the top of the file
jest.mock('class-validator', () => ({
  ...jest.requireActual('class-validator'),
  validateOrReject: jest.fn().mockResolvedValue(undefined),
}));

describe('TokenService', () => {
  let service: TokenService;
  let repository: Repository<Token>;
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
    timestamp: new Date(),
    price: 100,
    lastPriceUpdate: new Date(),
  };

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  const mockMapper = {
    toDto: jest.fn(),
    toDtoArray: jest.fn(),
    toEntity: jest.fn(),
    updateEntity: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        {
          provide: getRepositoryToken(Token),
          useValue: mockRepository,
        },
        {
          provide: TokenMapper,
          useValue: mockMapper,
        },
      ],
    }).compile();

    service = module.get<TokenService>(TokenService);
    repository = module.get<Repository<Token>>(getRepositoryToken(Token));
    mapper = module.get<TokenMapper>(TokenMapper);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return an array of token DTOs', async () => {
      const tokens = [mockToken];
      const tokenDtos = [{ ...mockToken }];

      mockRepository.find.mockResolvedValue(tokens);
      mockMapper.toDtoArray.mockReturnValue(tokenDtos);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalledWith({
        relations: ['chain', 'logo'],
      });
      expect(mapper.toDtoArray).toHaveBeenCalledWith(tokens);
      expect(result).toEqual(tokenDtos);
    });
  });

  describe('findOne', () => {
    it('should return a token DTO when found', async () => {
      const tokenDto = { ...mockToken };

      mockRepository.findOne.mockResolvedValue(mockToken);
      mockMapper.toDto.mockReturnValue(tokenDto);

      const result = await service.findOne('test-id');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        relations: ['chain', 'logo'],
      });
      expect(mapper.toDto).toHaveBeenCalledWith(mockToken);
      expect(result).toEqual(tokenDto);
    });

    it('should throw NotFoundException when token not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByAddress', () => {
    it('should return a token DTO when found', async () => {
      const tokenDto = { ...mockToken };

      mockRepository.findOne.mockResolvedValue(mockToken);
      mockMapper.toDto.mockReturnValue(tokenDto);

      const result = await service.findByAddress('0x123', 'chain-id');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { address: '0x123', chainId: 'chain-id' },
        relations: ['chain', 'logo'],
      });
      expect(mapper.toDto).toHaveBeenCalledWith(mockToken);
      expect(result).toEqual(tokenDto);
    });

    it('should return null when token not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findByAddress('0x123', 'chain-id');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new token', async () => {
      const createDto: CreateTokenDto = {
        address: '0x1234567890123456789012345678901234567890',
        symbol: 'NEW',
        name: 'New Token',
        decimals: 18,
        isNative: false,
        chainId: 'chain-id',
      };

      const newToken = { ...mockToken, ...createDto };
      const tokenDto = { ...newToken };

      mockRepository.findOne.mockResolvedValue(null); // Token doesn't exist
      mockMapper.toEntity.mockReturnValue(newToken);
      mockRepository.save.mockResolvedValue(newToken);
      mockMapper.toDto.mockReturnValue(tokenDto);

      const result = await service.create(createDto);

      expect(mapper.toEntity).toHaveBeenCalledWith(createDto);
      expect(repository.save).toHaveBeenCalledWith(newToken);
      expect(result).toEqual(tokenDto);
    });

    it('should throw error when token already exists', async () => {
      const createDto: CreateTokenDto = {
        address: '0x1234567890123456789012345678901234567890',
        symbol: 'EXIST',
        name: 'Existing Token',
        decimals: 18,
        isNative: false,
        chainId: 'chain-id',
      };

      mockRepository.findOne.mockResolvedValue(mockToken);
      mockMapper.toDto.mockReturnValue({ ...mockToken });

      await expect(service.create(createDto)).rejects.toThrow(
        `Token ${createDto.address} already exists on chain ${createDto.chainId}`,
      );
    });
  });

  describe('update', () => {
    it('should update an existing token', async () => {
      const updateDto: UpdateTokenDto = {
        symbol: 'UPDATED',
        name: 'Updated Token',
      };

      const updatedToken = { ...mockToken, ...updateDto };
      const tokenDto = { ...updatedToken };

      mockRepository.findOne.mockResolvedValue(mockToken);
      mockMapper.updateEntity.mockReturnValue(updatedToken);
      mockRepository.save.mockResolvedValue(updatedToken);
      mockMapper.toDto.mockReturnValue(tokenDto);

      const result = await service.update('test-id', updateDto);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        relations: ['chain', 'logo'],
      });
      expect(mapper.updateEntity).toHaveBeenCalledWith(mockToken, updateDto);
      expect(repository.save).toHaveBeenCalledWith(updatedToken);
      expect(result).toEqual(tokenDto);
    });

    it('should throw NotFoundException when token not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update('non-existent', {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updatePrice', () => {
    it('should update token price', async () => {
      const newPrice = 200;
      const updatedToken = { 
        ...mockToken, 
        price: newPrice,
        lastPriceUpdate: expect.any(Date),
      };
      const tokenDto = { ...updatedToken };

      mockRepository.findOne.mockResolvedValue(mockToken);
      mockRepository.save.mockResolvedValue(updatedToken);
      mockMapper.toDto.mockReturnValue(tokenDto);

      const result = await service.updatePrice('test-id', newPrice);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        relations: ['chain', 'logo'],
      });
      expect(repository.save).toHaveBeenCalledWith({
        ...mockToken,
        price: newPrice,
        lastPriceUpdate: expect.any(Date),
      });
      expect(result).toEqual(tokenDto);
    });

    it('should throw NotFoundException when token not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.updatePrice('non-existent', 100)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('should delete an existing token', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.delete('test-id');

      expect(repository.delete).toHaveBeenCalledWith('test-id');
    });

    it('should throw NotFoundException when token not found', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.delete('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
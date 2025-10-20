import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, In, Repository } from "typeorm";
import { Token } from "../entities/token.entity";

@Injectable()
export class TokenRepository {
  constructor(
    @InjectRepository(Token)
    private readonly repository: Repository<Token>
  ) {}

  async find(options: {
    where: FindOptionsWhere<Token>;
    relations?: string[];
  }): Promise<Token[]> {
    return this.repository.find(options);
  }

  async findByAddressesAndChain(
    addresses: string[],
    chainId: number
  ): Promise<Token[]> {
    return this.repository.find({
      where: {
        address: In(addresses),
        chain: { id: chainId },
      },
      relations: {
        token_metadata: true,
        logo: true,
      },
    });
  }

  create(data: Partial<Token>): Token {
    return this.repository.create(data);
  }

  async save(token: Token): Promise<Token>;
  async save(tokens: Token[]): Promise<Token[]>;
  async save(tokenOrTokens: Token | Token[]): Promise<Token | Token[]> {
    return this.repository.save(tokenOrTokens as any);
  }

  async bulkInsert(tokens: Token[]): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .insert()
      .into(Token)
      .values(tokens)
      .orIgnore()
      .execute();
  }

  async count(): Promise<number> {
    return this.repository.count();
  }

  async findPaginated(options: {
    skip: number;
    take: number;
    relations?: string[];
  }): Promise<Token[]> {
    return this.repository.find({
      skip: options.skip,
      take: options.take,
      relations: options.relations,
    });
  }
}

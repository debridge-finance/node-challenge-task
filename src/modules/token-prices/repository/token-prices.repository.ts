import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { TokenPrices } from "../entity/token-prices.entity";

@Injectable()
export class TokenPricesRepository {
  constructor(
    @InjectRepository(TokenPrices)
    private readonly repository: Repository<TokenPrices>
  ) {}

  create(data: Partial<TokenPrices>): TokenPrices {
    return this.repository.create(data);
  }

  async save(tokenPrice: TokenPrices): Promise<TokenPrices>;
  async save(tokenPrices: TokenPrices[]): Promise<TokenPrices[]>;
  async save(
    tokenPriceOrPrices: TokenPrices | TokenPrices[]
  ): Promise<TokenPrices | TokenPrices[]> {
    return this.repository.save(tokenPriceOrPrices as any);
  }

  async findById(id: number): Promise<TokenPrices | null> {
    return this.repository.findOne({ where: { id } });
  }
}

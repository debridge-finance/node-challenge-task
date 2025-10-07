import { Repository } from "typeorm";
import { Token } from "../entities/token.entity";
import { TokenPrice } from "../entities/token-price.entity";
import { OutboxService } from "../../infrastructure/services/outbox.service";

export interface ITokenPriceRepository {
  findActiveTokens(): Promise<Token[]>;
  findLastPrice(tokenId: string): Promise<number | null>;
  savePrice(tokenId: string, price: number): Promise<void>;
}

export class TokenPriceRepository implements ITokenPriceRepository {
  constructor(
    private readonly tokenRepo: Repository<Token>,
    private readonly tokenPriceRepo: Repository<TokenPrice>,
    private readonly outboxService: OutboxService
  ) {}

  async findActiveTokens(): Promise<Token[]> {
    return this.tokenRepo.find({
      where: { isActive: true },
      order: { priority: "ASC", id: "ASC" },
    });
  }

  async findLastPrice(tokenId: string): Promise<number | null> {
    const lastPrice = await this.tokenPriceRepo.findOne({
      where: { token: { id: tokenId } },
      order: { updated_at: "DESC" },
    });

    return lastPrice ? Number(lastPrice.price) : null;
  }

  async savePrice(tokenId: string, price: number): Promise<void> {
    // 1. Сохраняем цену
    const tokenPrice = this.tokenPriceRepo.create({
      token: { id: tokenId },
      price: price.toString(),
    });
    await this.tokenPriceRepo.save(tokenPrice);

    // 2. Создаем outbox событие через OutboxService
    await this.outboxService.createEvent("token-price-updates", {
      tokenId,
      price,
      timestamp: new Date().toISOString(),
    });
  }
}

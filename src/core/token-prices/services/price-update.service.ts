import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { TokenPriceEntity } from "../entities";
import { InjectRepository } from "@nestjs/typeorm";
import { TokenEntity } from "../../tokens/entities";
import { MockPriceService } from "./mock-price.service";
import { PriceNotificationService } from "./price-notification.service";

interface ITokenPrice {
  token_id: string;
  symbol: string;
  price: string | null;
}

@Injectable()
export class PriceUpdateService {
  constructor(
    @InjectRepository(TokenPriceEntity)
    private readonly pricesRepo: Repository<TokenPriceEntity>,
    private readonly eventBus: PriceNotificationService,
    private readonly pricesService: MockPriceService
  ) {}

  async updatePrices(timeoutMins: number): Promise<void> {
    const tokens = await this.tokensToUpdate();
    const tokenChunks = this.chunkArr(tokens, 10);
    for (const chunk of tokenChunks) {
      await this.updateBunch(chunk);
    }
  }

  private chunkArr<T>(arr: T[], size: number): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  }

  private tokensToUpdate(): Promise<ITokenPrice[]> {
    return this.pricesRepo.manager.transaction(async (manager) => {
      const repo = manager.getRepository(TokenPriceEntity);

      await manager.query(`SET LOCAL lock_timeout = 0;`);
      // shared lock
      await manager.query(
        `LOCK TABLE "${repo.metadata.tableName}" IN SHARE MODE;`
      );

      return await repo
        .createQueryBuilder("prices")
        .select("tokens.id as token_id")
        .select("tokens.symbol as symbol")
        .addSelect("prices.price as price")
        .leftJoin(TokenEntity, "tokens", "prices.token_id = tokens.id")
        .orderBy("prices.updated_at", "ASC", "NULLS FIRST")
        .getRawMany();
    });
  }

  private async updateBunch(tokens: ITokenPrice[]): Promise<void> {
    await this.pricesRepo.manager.transaction(async (manager) => {
      const repo = manager.getRepository(TokenPriceEntity);

      await manager.query(`SET LOCAL lock_timeout = 0;`);
      // shared lock
      await manager.query(
        `LOCK TABLE "${repo.metadata.tableName}" IN SHARE MODE;`
      );

      for (const token of tokens) {
        await this.updateToken(repo, token);
      }
    });
  }

  // TODO: add timeout
  private async updateToken(
    repo: Repository<TokenPriceEntity>,
    token: ITokenPrice
  ): Promise<void> {
    const newPrice = await this.pricesService.getRandomPriceForToken();
    await repo.update(token.token_id, { price: newPrice });
    await this.eventBus.sendEvent({
      tokenId: token.token_id,
      symbol: token.symbol,
      newPrice,
      oldPrice: Number(token.price), // TODO: better to send as a string or Decimal
    });
  }
}

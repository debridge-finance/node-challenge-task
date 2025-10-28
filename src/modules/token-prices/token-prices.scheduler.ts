import {
  BeforeApplicationShutdown,
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { DataSource } from 'typeorm';
import { TokenUpdatePricesService } from './token-prices.service';
import { Token } from '../..//models/entities';
import { serviceConfig } from '../../config';

@Injectable()
export class TokenUpdatePricesScheduler implements OnApplicationBootstrap, BeforeApplicationShutdown {
  private boostrapped = false;
  private logger = new Logger(TokenUpdatePricesScheduler.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly service: TokenUpdatePricesService,
  ) {
  }

  onApplicationBootstrap() {
    this.boostrapped = true;
  }

  beforeApplicationShutdown() {
    this.boostrapped = false;
  }

  @Interval(serviceConfig().updatePriceIntervalSec * 1000)
  async schedulePriceUpdate() {
    if (!this.boostrapped) {
      return;
    }

    // NOTE: for now we will fetch all, but of course it's better to this via pagination
    const tokens = await this.dataSource.getRepository(Token).find({
      select: { id: true },
    });

    this.logger.debug(`Scheduling price update for ${tokens.length} tokens...`);

    // NOTE: we should limit concurrency here in real world scenaria
    // and this is easy with p-limit lib, but this will require reconfigure
    // tsconfig to support eslib ore add fresh node.js requirements
    // for now i assume there is 3 tokens))
    await Promise.all(tokens.map(async (t) => {
      try {
        const res = await this.service.updatePriceFor(t.id);
        if (!res.success) {
          this.logger.warn(`unabled to update token price because of: ${res.reason}`);
        }
      } catch (err) {
        this.logger.error({ err }, `unexpected erro on token[${t.id}] price update`);
      }
    }));
  }
}

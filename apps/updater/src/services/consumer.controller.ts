import { Logger, Controller } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Feed } from '../models/feed.entity';
import { tokenBatchMessageSchema } from '../models/token-batch-message';
import { TokenProcessorService } from './token-processor.service';

@Controller()
export class Consumer {
  private readonly logger = new Logger(Consumer.name);
  private readonly instanceId = Math.random().toString(36).substring(2, 10);

  constructor(
    @InjectRepository(Feed)
    private readonly feedRepository: Repository<Feed>,
    private readonly tokenProcessorService: TokenProcessorService,
  ) {}

  @MessagePattern('token-batches')
  async handleTokenBatch(@Payload() message: unknown) {
    try {
      const parsedMessage = tokenBatchMessageSchema.parse(message);
      this.logger.log(
        `[Instance ${this.instanceId}] Received token batch with ID: ${parsedMessage.batchId}, timestamp: ${parsedMessage.timestamp}`,
      );

      const feedEntries = parsedMessage.tokens.map((token) => ({
        tokenId: token.id,
        symbol: token.symbol,
        oldPrice: token.oldPrice,
      }));

      const savedEntries = await this.feedRepository.save(feedEntries);
      this.logger.log(
        `[Instance ${this.instanceId}] Saved ${savedEntries.length} tokens to feed table`,
      );

      await this.tokenProcessorService.processTokensBatch(savedEntries);
      this.logger.log(`[Instance ${this.instanceId}] Successfully processed token batch`);
    } catch (error) {
      if (error.errors) {
        this.logger.error(
          `[Instance ${this.instanceId}] Error processing token batch: ${JSON.stringify(
            error.errors,
          )}`,
        );
      } else {
        this.logger.error(
          `[Instance ${this.instanceId}] Error processing token batch: ${error.message}`,
          error.stack,
        );
      }
    }
  }
}

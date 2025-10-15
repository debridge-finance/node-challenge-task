import { Logger, Controller } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Feed } from './models/feed.entity';
import { tokenBatchMessageSchema } from './models/token-batch-message';
import { TokenProcessorService } from './services/token-processor.service';

@Controller()
export class TokenBatchConsumer {
  private readonly logger = new Logger(TokenBatchConsumer.name);

  constructor(
    @InjectRepository(Feed)
    private readonly feedRepository: Repository<Feed>,
    private readonly tokenProcessorService: TokenProcessorService,
  ) {}

  @MessagePattern('token-batches')
  async handleTokenBatch(@Payload() message: unknown) {
    const parsedMessage = tokenBatchMessageSchema.parse(message);
    this.logger.log(
      `Received token batch with ID: ${parsedMessage.batchId}, timestamp: ${parsedMessage.timestamp}`,
    );

    const feedEntries = parsedMessage.tokens.map((token) => ({
      tokenId: token.id,
      symbol: token.symbol,
      oldPrice: token.oldPrice,
    }));

    const savedEntries = await this.feedRepository.save(feedEntries);
    this.logger.log(`Saved ${savedEntries.length} tokens to feed table`);

    await this.tokenProcessorService.processTokensBatch(savedEntries);
    this.logger.log(`Successfully processed token batch`);
  }
}

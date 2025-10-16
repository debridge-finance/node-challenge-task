import { ExceptionFilter, Catch, Logger } from '@nestjs/common';
import { KafkaJSError } from 'kafkajs';

@Catch(KafkaJSError)
export class KafkaExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(KafkaExceptionsFilter.name);

  catch(exception: KafkaJSError) {
    this.logger.error(`Kafka Exception: ${exception.message}`, exception.stack);
  }
}

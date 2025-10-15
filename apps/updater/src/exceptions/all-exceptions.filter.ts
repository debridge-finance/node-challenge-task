import { ExceptionFilter, Catch, Logger } from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown) {
    const message = exception instanceof Error ? exception.message : 'Internal server error';
    const stack = exception instanceof Error ? exception.stack : 'No stack trace available';

    this.logger.error(`Exception: ${message}`, stack);
  }
}

import { ExceptionFilter, Catch, Logger } from '@nestjs/common';
import { TypeORMError } from 'typeorm';

@Catch(TypeORMError)
export class DatabaseExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(DatabaseExceptionsFilter.name);

  catch(exception: TypeORMError) {
    this.logger.error(`Database Exception: ${exception.message}`, exception.stack);
  }
}

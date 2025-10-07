import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: HttpStatus;
    let responseBody: Record<string, unknown>;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      responseBody = {
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        message: this.normalizeMessage(exceptionResponse),
      };
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      responseBody = {
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        message: "Internal server error",
      };
    }

    if (status >= 500) {
      this.logError(request, exception);
    }

    response.status(status).json(responseBody);
  }

  private normalizeMessage(message: unknown): string {
    if (typeof message === "string") return message;
    if (typeof message === "object" && message !== null) {
      return (message as { message?: string }).message || JSON.stringify(message);
    }
    return "Unexpected error";
  }

  private logError(request: Request, exception: unknown): void {
    this.logger.error(
      `${request.method} ${request.url} ${exception instanceof Error ? exception.stack : ""}`
    );
  }
}

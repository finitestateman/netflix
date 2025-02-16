import { ExceptionFilter, Catch, ArgumentsHost, Logger, ForbiddenException } from '@nestjs/common';
import { Request as ExpressRequest, Response as ExpressResponse } from 'express';

@Catch(ForbiddenException)
export class ForbiddenExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(ForbiddenExceptionFilter.name);

    public catch(exception: ForbiddenException, host: ArgumentsHost): void {
        // host는 executionContext의 부모다
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<ExpressResponse>();
        const request = ctx.getRequest<ExpressRequest>();

        const status = exception.getStatus();

        console.error(`[ForbiddenException] ${request.method} ${request.path}`);

        response.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            message: '권한이 없습니다!',
        });
    }
}

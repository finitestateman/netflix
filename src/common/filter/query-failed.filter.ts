import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { Request as ExpressRequest, Response as ExpressResponse } from 'express';

@Catch(QueryFailedError)
export class QueryFailedFilter implements ExceptionFilter {
    public catch(exception: QueryFailedError, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<ExpressResponse>();
        const request = ctx.getRequest<ExpressRequest>();

        const status = HttpStatus.INTERNAL_SERVER_ERROR;

        let message = '데이터베이스 에러 발생';

        // TODO: 에러코드로 처리하도록 수정하기(23505)
        if (exception.message.includes('duplicate key')) {
            message = '중복 키 에러!';
        }

        response.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            message,
        });

        console.error(`[QueryFailedError] ${request.method} ${request.path}`);
    }
}

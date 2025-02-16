import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { Request as ExpressRequest, Response as ExpressResponse } from 'express';

const PG_ERROR_UNIQUE_VIOLATION = '23505';

@Catch(QueryFailedError)
export class QueryFailedFilter<T extends QueryFailedError> implements ExceptionFilter {
    public catch(exception: T, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<ExpressResponse>();
        const request = ctx.getRequest<ExpressRequest>();

        const status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = '데이터베이스 에러 발생';

        // PostgreSQL 에러 코드 처리
        if ('code' in exception && exception.code === PG_ERROR_UNIQUE_VIOLATION) {
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

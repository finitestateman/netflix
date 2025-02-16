import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, of, tap } from 'rxjs';
import { Request as ExpressRequest } from 'express';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
    private cache = new Map<string, unknown>();

    public intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest<ExpressRequest>();

        // GET /movie
        const key = `${request.method}-${request.path}`;

        if (this.cache.has(key)) {
            console.info(`Cache hit: ${key}`);
            return of(this.cache.get(key));
        }

        return next.handle().pipe(
            tap((response) => {
                console.info(`Cache miss: ${key}`);
                this.cache.set(key, response);
            }),
        );
    }
}

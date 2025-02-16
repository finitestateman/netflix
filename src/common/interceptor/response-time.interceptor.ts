import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    InternalServerErrorException,
} from '@nestjs/common';
import { delay, Observable, tap } from 'rxjs';
import { Request as ExpressRequest } from 'express';

@Injectable()
export class ResponseTimeInterceptor implements NestInterceptor {
    public intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        const req = context.switchToHttp().getRequest<ExpressRequest>();

        const reqTime = Date.now();

        return next.handle().pipe(
            // delay(1000),
            tap(() => {
                const respTime = Date.now();
                const diff = respTime - reqTime;

                console.log(`[${req.method}] ${req.path} ${diff}ms`);
            }),
        );
    }
}

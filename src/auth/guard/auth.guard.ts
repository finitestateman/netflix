import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Payload } from '../auth.types';
import { Request as ExpressRequest } from 'express';
@Injectable()
export class AccessTokenGuard implements CanActivate {
    public canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        // 요청에서 user 객체가 존재하는지 확인한다
        // 존재하지 않거나 tokenType이 access가 아니면 false를 반환한다
        // bearerTokenMiddleware는 토큰을 파싱/검증만 하고 요청에 user 객체를 추가한다
        // guard는 실제로 user 객체를 바탕으로 인가를 할지 말지 결정한다
        const request = context.switchToHttp().getRequest<ExpressRequest & { user: Payload }>();

        if (!request.user || request.user.tokenType !== 'access') {
            return false;
        }

        return true;
    }
}

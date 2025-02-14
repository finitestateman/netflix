import { HttpException, Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { JsonWebTokenError, JwtService } from '@nestjs/jwt';
import { JwtClaim } from '../auth.types';
import { TokenExpiredError } from '@nestjs/jwt';
import { NextFunction, Request, Response } from 'express';
import { Payload } from '../auth.types';
import { DOTENV } from 'src/common/const/env.const';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { Public } from '../decorator/public.decorator';

// interface NestMiddleware<TRequest = any, TResponse = any> {
//     use(req: TRequest, res: TResponse, next: (error?: Error | any) => void): any;
// }
@Injectable()
export class BearerTokenMiddleware implements NestMiddleware {
    public constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly reflector: Reflector,
    ) {}

    // interface NextFunction { (error?: Error | any): void }
    public async use(req: Request, _res_: Response, next: NextFunction): Promise<any> {
        // (Basic | Bearer) <token>
        const authHeader = req.headers.authorization; // req.headers['authorization']
        // 헤더가 없으면 인증 자체를 하지 않는 경우이므로 다음 미들웨어로 넘어감
        if (!authHeader) {
            next();
            return;
        }

        try {
            const token = this.validateBearerToken(authHeader);
            // 클라이언트가 보낸 Payload가 무슨 형태일지 모르므로 제네릭을 쓰는 것은 썩 올바르지 않을 수 있다
            const { tokenType } = this.jwtService.decode<JwtClaim>(token);
            if (tokenType === undefined) {
                throw new JsonWebTokenError('Invalid token: missing token type');
            } else if (tokenType !== 'refresh' && tokenType !== 'access') {
                throw new JsonWebTokenError("Invalid token type: expected 'refresh' or 'access'");
            }

            const secret =
                tokenType === 'refresh'
                    ? this.configService.get<string>(DOTENV.REFRESH_TOKEN_SECRET)
                    : this.configService.get<string>(DOTENV.ACCESS_TOKEN_SECRET);

            const payload: Payload = await this.jwtService.verifyAsync<JwtClaim>(token, { secret });

            req.user = payload;
            next();

            // export { TokenExpiredError, NotBeforeError, JsonWebTokenError } from 'jsonwebtoken';
        } catch (e) {
            // 강의에선 분기 처리를 안 해서 모두 토큰 만료로 응답한다
            // 강의에서 e.name == 'TokenExpiredError'로 하지만 e instanceof TokenExpiredError로 하는 게 더 좋다
            /* 이 에러 처리 때문에 @Public()에 요청 시 만료된 토큰을 사용하면 에러가 던져진다
                -> auth.guard.ts@AccessTokenGuard에서 Public은 통과시키도록 한 것이 토큰 만료에는 효과가 없어져버렸다
                -> 이 문제를 해결하기 위해 executionContext를 가져오고자 했지만 불가능했고 Request객체에 error 프로퍼티를 추가해서 해결해보았다
                -> 자꾸 Request 객체에 임의의 프로퍼티가 붙게 돼버려서 따로 interface를 확장하는 등의 좀 나은 방법이 필요하다
            */
            if (e instanceof TokenExpiredError) {
                const uae = new UnauthorizedException({
                    message: `토큰이 만료되었습니다! (${e.message})`,
                    expiredAt: e.expiredAt,
                });
                // } else if (e instanceof JsonWebTokenError) {
                //     throw new UnauthorizedException(`토큰이 유효하지 않습니다! (${e.message})`);
                // } else {
                //     next();
                // }
                (req as Request & { error: Error }).error = uae;
            }
            // try절에서 throw한 error가 next()에 의해 무시되고 가드로 넘어간다
            // (위의 next()에서 에러 핸들링만 제대로 했다면 가드에서는 if (!request.user ...) 덕에 canActivate가 false가 반환되긴한다)
            next();
        }
    }

    public validateBearerToken(rawToken: string): string {
        const bearerSplit = rawToken.split(' ');
        if (bearerSplit.length !== 2) {
            // throw new BadRequestException('토큰의 형식이 잘못됐습니다!');
            throw new JsonWebTokenError('Invalid token format: expected "Bearer <token>"');
        }

        const [scheme, token] = bearerSplit;
        if (scheme !== 'Bearer') {
            // throw new BadRequestException('token의 스키마가 Bearer가 아닙니다!');
            throw new JsonWebTokenError("Invalid token scheme: expected 'Bearer'");
        }

        return token;
    }
}

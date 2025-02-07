import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { JsonWebTokenError, JwtService } from '@nestjs/jwt';
import { JwtClaim } from '../auth.types';
import { TokenExpiredError } from '@nestjs/jwt';
import { NextFunction, Request, Response } from 'express';
import { Payload } from '../auth.types';
import { DOTENV } from 'src/common/const/env.const';
import { ConfigService } from '@nestjs/config';

// interface NestMiddleware<TRequest = any, TResponse = any> {
//     use(req: TRequest, res: TResponse, next: (error?: Error | any) => void): any;
// }
@Injectable()
export class BearerTokenMiddleware implements NestMiddleware {
    public constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
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
        const token = this.validateBearerToken(authHeader);

        try {
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
            // 강의에선 분기 처리를 안 해서 모두 토근 만료로 응답한다
            if (e instanceof TokenExpiredError) {
                throw new UnauthorizedException({
                    message: `토큰이 만료되었습니다! (${e.message})`,
                    expiredAt: e.expiredAt,
                });
            } else if (e instanceof JsonWebTokenError) {
                throw new UnauthorizedException(`토큰이 유효하지 않습니다! (${e.message})`);
            } else {
                throw e;
            }
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

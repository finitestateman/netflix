import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { AuthGuard } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Payload } from '../auth.types';
import { DOTENV } from 'src/common/const/env.const';

const STRATEGY_NAME = 'jwt';
export class JwtAuthGuard extends AuthGuard(STRATEGY_NAME) {}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    public constructor(private readonly configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // 그 외에 여러가지 ExtractJwt.fromXXX()가 있다
            ignoreExpiration: false,
            secretOrKey: configService.get<string>(DOTENV.ACCESS_TOKEN_SECRET),
        });
    }

    public validate(payload: Payload): Payload {
        // 여기서 반환한 게 Controller의 req.user에 들어간다
        return payload;
    }
}

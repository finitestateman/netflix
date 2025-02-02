import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { AuthGuard } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { RegisteredClaim } from '../auth.types';

const STRATEGY_NAME = 'jwt';
export class JwtAuthGuard extends AuthGuard(STRATEGY_NAME) {}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    public constructor(private readonly configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // 그 외에 여러가지 ExtractJwt.fromXXX()가 있다
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('ACCESS_TOKEN_SECRET'),
        });
    }

    public validate(payload: RegisteredClaim): RegisteredClaim {
        // 여기서 반환한 게 Controller의 req.user에 들어간다
        return payload;
    }
}

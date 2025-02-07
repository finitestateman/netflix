import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { IStrategyOptions, Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Payload } from '../auth.types';
import { User } from 'src/user/entities/user.entity';
// https://www.passportjs.org/packages/passport-local/

const STRATEGY_NAME = 'custom';

export class CustomAuthGuard extends AuthGuard(STRATEGY_NAME) {
    // ! handleRequest의 상속이 불완전하다
    public handleRequest<T = Payload>(err: any, payload: T, info: any, context: ExecutionContext, status?: any): T {
        // payload를 반환했는데 req.user에서 any 타입으로 꺼내오는 게 마음에 들지 않아 직접 request 객체에 실험적으로 넣어줘봤다
        // 하지만 여전히 payload를 return을 하긴 하므로 req.user에도 동일한 값이 들어가긴 한다
        // 하지만 user에 담는 것이 좋은 것 같다
        const request = context.switchToHttp().getRequest<Express.Request & { payload: T }>();
        request.payload = payload;
        return payload;
    }
}

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, STRATEGY_NAME) {
    public constructor(private readonly authService: AuthService) {
        const options: IStrategyOptions = {
            usernameField: 'email',
            passwordField: 'password',
            // session: true,
            // passReqToCallback: false,
        };
        super(options);
    }

    /**
     *
     * @param email
     * @param password
     * @returns Request()의 user에 들어갈 객체
     */
    public async validate(email: string, password: string): Promise<Payload> {
        const user: User = await this.authService.authenticate(email, password);
        // 여기선 payload를 반환했지만 원래대로라면 user를 반환하는 게 맞다(다만 authenticate의 반환값이 user인 게 좀 의문이다)
        const payload: Payload = { sub: user.id, role: user.role };
        return payload;
    }
}

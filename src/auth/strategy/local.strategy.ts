import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { IStrategyOptions, Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { User } from 'src/user/entities/user.entity';
import { Injectable } from '@nestjs/common';

// https://www.passportjs.org/packages/passport-local/

const STRATEGY_NAME = 'custom';

export class CustomAuthGuard extends AuthGuard(STRATEGY_NAME) {}

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
     * @returns Request()
     */
    public async validate(email: string, password: string): Promise<User> {
        const user = await this.authService.authenticate(email, password);
        // 여기서 반환한 게 Controller의 req.user에 들어간다
        // 변수나 class의 이름이 user이어서 user에 들어가는 것이 아니다
        return user;
    }
}

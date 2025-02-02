import { Controller, Get, Headers, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from 'src/user/entities/user.entity';
import type { AuthTokens } from './auth.types';
import { CustomAuthGuard } from './strategy/local.strategy';
import { JwtAuthGuard } from './strategy/jwt.strategy';

@Controller('auth')
export class AuthController {
    public constructor(private readonly authService: AuthService) {}

    @Post('register')
    // @Headers()는 글로벌 객체말고 @nestjs/common 객체를 사용해야 함
    // Authorization: Basic <token>
    public registerUser(@Headers('Authorization') token: string): Promise<User> {
        return this.authService.register(token);
    }

    @Post('login')
    public loginUser(@Headers('Authorization') token: string): Promise<AuthTokens> {
        return this.authService.login(token);
    }

    // @UseGuards(AuthGuard('custom')) // 이렇게 하면 문자열 실수할 수 있으니 local.strategy.ts 에서 만든 CustomAuthGuard 사용
    @UseGuards(CustomAuthGuard)
    @Post('login/passport')
    // https://docs.nestjs.com/controllers#request-object
    // https://velog.io/@hyejiining/NestJS-Request%EC%99%80-Req-%EC%B0%A8%EC%9D%B4%EC%A0%90
    // Express.Request가 아닌 그냥 Request에는 user 속성이 없다
    public async loginUserPassport(@Request() req: Express.Request): Promise<AuthTokens> {
        return {
            accessToken: await this.authService.issueToken(req.user as User, 'access'),
            refreshToken: await this.authService.issueToken(req.user as User, 'refresh'),
        };
    }
}

import { Controller, Get, Headers, Post, Request, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from 'src/user/entities/user.entity';
import type { AuthTokens, JwtClaim, Payload } from './auth.types';
import { CustomAuthGuard } from './strategy/local.strategy';
import { JwtAuthGuard } from './strategy/jwt.strategy';
import { Request as ExpressRequest } from 'express';
import { Public } from './decorator/public.decorator';

@Controller('auth')
export class AuthController {
    public constructor(private readonly authService: AuthService) {}

    @Public()
    @Post('register')
    // @Headers()는 글로벌 객체말고 @nestjs/common 객체를 사용해야 함
    // Authorization: Basic <token>
    public registerUser(@Headers('Authorization') token: string): Promise<User> {
        return this.authService.register(token);
    }

    @Public()
    @Post('login')
    public loginUser(@Headers('Authorization') token: string): Promise<AuthTokens> {
        return this.authService.login(token);
    }

    // @UseGuards(AuthGuard('custom')) // 이렇게 하면 문자열 실수할 수 있으니 local.strategy.ts 에서 만든 CustomAuthGuard 사용
    @UseGuards(CustomAuthGuard)
    @Post('login/passport')
    // https://docs.nestjs.com/controllers#request-object
    // @Req(), @Request()의 차이는 아래 블로그 참고
    // https://velog.io/@hyejiining/NestJS-Request%EC%99%80-Req-%EC%B0%A8%EC%9D%B4%EC%A0%90
    // Request는 따로 import 하지않아도 사용할 수 있기 때문에 반드시 import 해주되 @nestjs/common과 겹치므로 alias로 import 해준다
    // 따라서 ExpressRequest & { user: User } 정도로 덮어써도 될 것 같다(ExpressRequest.user는 {}이고 인터섹션 뒤의 user는 user.tntity.User이다)
    public async loginUserPassport(@Request() req: ExpressRequest & { user: Payload }): Promise<AuthTokens> {
        const { sub, role } = req.user;
        const jwtClaim: JwtClaim = { sub, role };

        return {
            accessToken: await this.authService.issueToken({ ...jwtClaim, tokenType: 'access' }),
            refreshToken: await this.authService.issueToken({ ...jwtClaim, tokenType: 'refresh' }),
        };
    }

    @UseGuards(JwtAuthGuard)
    @Get('private')
    public private(@Request() req: ExpressRequest & { user: Payload }): Payload {
        // iat와 exp가 포함되어있다
        return req.user;
    }

    @Post('token/access')
    public async rotateAccessToken(
        @Request() req: ExpressRequest & { user: Payload },
    ): Promise<Pick<AuthTokens, 'accessToken'>> {
        const { sub, role, tokenType }: Payload = req.user;
        if (tokenType !== 'refresh') {
            throw new UnauthorizedException('refresh 토큰으로만 access 토큰을 재발급할 수 있습니다!');
        }

        return {
            accessToken: await this.authService.issueToken({ sub, role, tokenType }),
        };
    }
}

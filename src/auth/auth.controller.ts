import { Controller, Headers, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from 'src/user/entities/user.entity';
import type { AuthTokens } from './auth.types';

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
}

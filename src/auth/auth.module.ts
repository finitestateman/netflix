import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from 'src/user/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './strategy/local.strategy';

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        JwtModule.register({
            /* 여기서 옵션을 넣어줄 수 있지만 auth/refresh 개별 적용을 위해 service에서 각각 넣어준다 */
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, LocalStrategy],
    exports: [AuthService],
})
export class AuthModule {}

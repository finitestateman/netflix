import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import type { AuthTokens, JwtClaim, Payload } from './auth.types';
import { JsonWebTokenError, JwtService, TokenExpiredError } from '@nestjs/jwt';
import { DOTENV } from 'src/common/const/env.const';
import type { StringValue } from 'ms';

@Injectable()
export class AuthService {
    public constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
    ) {}

    public parseBasicToken(rawToken: string): Pick<User, 'email' | 'password'> {
        const basicSplit = rawToken.split(' ');
        if (basicSplit.length !== 2) {
            throw new BadRequestException('토큰의 형식이 잘못됐습니다!');
        }

        const [scheme, token] = basicSplit;

        if (scheme !== 'Basic') {
            throw new BadRequestException('token의 스키마가 Basic이 아닙니다!');
        }

        // 2 추출한 토큰을 base64 디코딩하여 이메일과 비밀번호로 분리
        const decoded = Buffer.from(token, 'base64').toString('utf-8');

        // decoded = email:password
        const tokenSplit = decoded.split(':');

        if (tokenSplit.length !== 2) {
            throw new BadRequestException('이메일과 비밀번호의 형식이 잘못됐습니다!');
        }

        const [email, password] = tokenSplit;
        return { email, password };
    }

    // refresh 토큰으로만 access 토큰을 rotate하므로 isRefreshToken 파라미터같은 게 필요 없어보이는데 강의에선 이 메서드가 다른 데로 옮겨가면서 버려진다
    public async parseBearerToken(rawToken: string): Promise<Payload> {
        const bearerSplit = rawToken.split(' ');
        if (bearerSplit.length !== 2) {
            throw new BadRequestException('토큰의 형식이 잘못됐습니다!');
        }

        const [scheme, token] = bearerSplit;
        if (scheme !== 'Bearer') {
            throw new BadRequestException('token의 스키마가 Bearer가 아닙니다!');
        }

        try {
            const payload: Payload = await this.jwtService.verifyAsync<JwtClaim>(token, {
                secret: this.configService.get<string>(DOTENV.REFRESH_TOKEN_SECRET),
            });

            if (payload.tokenType !== 'refresh') {
                throw new BadRequestException('refresh 토큰을 입력해주세요!');
            }
            return payload;
            // export { TokenExpiredError, NotBeforeError, JsonWebTokenError } from 'jsonwebtoken';
        } catch (e) {
            // 강의에선 분기 처리를 안 해서 모두 토근 만료로 응답한다
            if (e instanceof TokenExpiredError) {
                throw new UnauthorizedException({
                    message: `refresh 토큰이 만료되었습니다! (${e.message})`,
                    expiredAt: e.expiredAt,
                });
            } else if (e instanceof JsonWebTokenError) {
                throw new UnauthorizedException(`refresh 토큰이 유효하지 않습니다! (${e.message})`);
            } else {
                throw e;
            }
        }
    }

    // rawToken = Basic <token>
    public async register(rawToken: string): Promise<User> {
        const { email, password } = this.parseBasicToken(rawToken);

        const user = await this.userRepository.findOne({ where: { email } });

        if (user) {
            throw new ConflictException('이미 가입된 이메일입니다!');
        }

        const hashedPassword = await bcrypt.hash(password, this.configService.get<number>(DOTENV.HASH_SALT_ROUNDS));

        const newUser = this.userRepository.create({ email, password: hashedPassword });
        await this.userRepository.save(newUser);

        return this.userRepository.findOne({ where: { email } });
    }

    public async authenticate(email: string, password: string): Promise<User> {
        const user = await this.userRepository.findOne({ where: { email } });

        if (!user) {
            throw new BadRequestException('가입되지 않은 이메일입니다!');
        }

        const passwordMatched = await bcrypt.compare(password, user.password);

        if (!passwordMatched) {
            throw new BadRequestException('비밀번호가 일치하지 않습니다!');
        }

        return user;
    }

    public async issueToken(payload: Required<JwtClaim>): Promise<string> {
        const accessTokenSecret = this.configService.get<string>(DOTENV.ACCESS_TOKEN_SECRET);
        const refreshTokenSecret = this.configService.get<string>(DOTENV.REFRESH_TOKEN_SECRET);

        const secret = payload.tokenType === 'access' ? accessTokenSecret : refreshTokenSecret;
        // https://github.com/vercel/ms
        const expiresIn: StringValue = payload.tokenType === 'access' ? '3m' : '1d';

        const token = await this.jwtService.signAsync(payload, { secret, expiresIn });
        return token;
    }

    public async login(rawToken: string): Promise<AuthTokens> {
        const { email, password } = this.parseBasicToken(rawToken);
        const user = await this.authenticate(email, password);

        const jwtClaim: JwtClaim = { sub: user.id, role: user.role };

        const accessToken = await this.issueToken({ ...jwtClaim, tokenType: 'access' });
        const refreshToken = await this.issueToken({ ...jwtClaim, tokenType: 'refresh' });

        return { accessToken, refreshToken };
    }
}

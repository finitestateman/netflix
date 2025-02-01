import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    public constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly configService: ConfigService,
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

    // rawToken = Basic <token>
    public async register(rawToken: string): Promise<User> {
        const { email, password } = this.parseBasicToken(rawToken);

        const user = await this.userRepository.findOne({ where: { email } });

        if (user) {
            throw new ConflictException('이미 가입된 이메일입니다!');
        }

        const hashedPassword = await bcrypt.hash(password, this.configService.get<number>('HASH_SALT_ROUNDS'));

        const newUser = this.userRepository.create({ email, password: hashedPassword });
        await this.userRepository.save(newUser);

        return this.userRepository.findOne({ where: { email } });
    }
}

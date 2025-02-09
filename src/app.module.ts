import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { MovieModule } from './movie/movie.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { Movie } from './movie/entity/movie.entity';
import { MovieDetail } from './movie/entity/movie-detail.entity';
import { DirectorModule } from './director/director.module';
import { Director } from './director/entity/director.entity';
import { GenreModule } from './genre/genre.module';
import { Genre } from './genre/entities/genre.entity';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { User } from './user/entities/user.entity';
import { DOTENV } from './common/const/env.const';
import { DatabaseType } from 'typeorm';
import { BearerTokenMiddleware } from './auth/middleware/bearer-token.middleware';
import { AccessTokenGuard } from './auth/guard/auth.guard';
import { APP_GUARD } from '@nestjs/core';

@Module({
    // 또다른 module을 import할 때
    imports: [
        ConfigModule.forRoot({
            isGlobal: true, // 어떤 모듈에서든 configModule을 사용할 수 있도록 함
            validationSchema: Joi.object({
                ENV: Joi.string().valid('dev', 'prod').required(),
                DB_TYPE: Joi.string().valid('postgres').required(),
                DB_HOST: Joi.string().required(),
                DB_PORT: Joi.number().required(),
                DB_USERNAME: Joi.string().required(),
                DB_PASSWORD: Joi.string().required(),
                DB_DATABASE: Joi.string().required(),
                HASH_SALT_ROUNDS: Joi.number().required(),
                ACCESS_TOKEN_SECRET: Joi.string().required(),
                REFRESH_TOKEN_SECRET: Joi.string().required(),
            }),
        }),
        TypeOrmModule.forRootAsync({
            useFactory: (configService: ConfigService) => ({
                // sqljs는 database 옵션과 공존할 수 없어서 제외해야한다
                type: configService.get<Exclude<DatabaseType, 'sqljs'>>(DOTENV.DB_TYPE),
                host: configService.get<string>(DOTENV.DB_HOST),
                port: configService.get<number>(DOTENV.DB_PORT),
                username: configService.get<string>(DOTENV.DB_USERNAME),
                password: configService.get<string>(DOTENV.DB_PASSWORD),
                database: configService.get<string>(DOTENV.DB_DATABASE),
                entities: [Movie, MovieDetail, Director, Genre, User],
                synchronize: true,
            }),
            inject: [ConfigService],
        }),
        MovieModule,
        DirectorModule,
        GenreModule,
        AuthModule,
        UserModule,
    ],
    // import를 하는 module에서 쓸 수 있게 하고 싶은 것들을 export에 적어준다
    exports: [],
    controllers: [],
    // service는 로직을 담당하는 provider(=자바의 Bean) 중 하나이다
    // 나중에는 repository나 guard 같은 것들도 providers에 들어간다
    // inject 해줄 수 있는 것들이 provider에 들어간다
    providers: [
        {
            provide: APP_GUARD,
            useClass: AccessTokenGuard,
        },
    ],
})
export class AppModule implements NestModule {
    public configure(consumer: MiddlewareConsumer): any {
        consumer
            .apply(BearerTokenMiddleware)
            .exclude(
                {
                    path: 'auth/login',
                    method: RequestMethod.POST,
                },
                {
                    path: 'auth/register',
                    method: RequestMethod.POST,
                },
            )
            .forRoutes('*');
    }
}

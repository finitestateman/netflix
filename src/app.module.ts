import { Module } from '@nestjs/common';
import { MovieModule } from './movie/movie.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';

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
      }),
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: configService.get<string>('DB_TYPE') as 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    MovieModule,
  ],
  // import를 하는 module에서 쓸 수 있게 하고 싶은 것들을 export에 적어준다
  exports: [],
  controllers: [],
  // service는 로직을 담당하는 provider(=자바의 Bean) 중 하나이다
  // 나중에는 repository나 guard 같은 것들도 providers에 들어간다
  // inject 해줄 수 있는 것들이 provider에 들어간다
  providers: [],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { MovieModule } from './movie/movie.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

@Module({
  // 또다른 module을 import할 때
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: process.env.DB_TYPE as 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [],
      synchronize: true,
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

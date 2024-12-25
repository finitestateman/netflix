import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [],
  controllers: [AppController],
  // service는 로직을 담당하는 provider(=자바의 Bean) 중 하나이다
  // 나중에는 repository나 guard 같은 것들도 providers에 들어간다
  providers: [AppService],
})
export class AppModule {}

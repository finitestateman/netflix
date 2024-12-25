import { Module } from '@nestjs/common';
import { MovieModule } from './movie/movie.module';

@Module({
  // 또다른 module을 import할 때
  imports: [MovieModule],
  // import를 하는 module에서 쓸 수 있게 하고 싶은 것들을 export에 적어준다
  exports: [],
  controllers: [],
  // service는 로직을 담당하는 provider(=자바의 Bean) 중 하나이다
  // 나중에는 repository나 guard 같은 것들도 providers에 들어간다
  // inject 해줄 수 있는 것들이 provider에 들어간다
  providers: [],
})
export class AppModule {}

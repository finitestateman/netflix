import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { AppService } from './app.service';

/**
 * Controller: 요청 자체, query, body, param 등에 대한 것만 처리한다
 * Service: 로직을 처리한다
 */
@Controller('movie')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getMovies(@Query('title') title?: string) {
    return this.appService.getManyMovies(title);
  }

  @Get(':id')
  getMovie(@Param('id') id: string) {
    return this.appService.getMovieById(+id);
  }

  // @Post()
  // postMovie(@Body('title') title: string) {
  //   const movie: Movie = {
  //     id: this.idCounter++,
  //     title: title,
  //   };

  //   this.movies.push(movie);

  //   // 다른 건 몰라도 id값은 클라이언트에게 넘겨줘야 한다
  //   return movie;
  // }

  // @Patch(':id')
  // patchMovie(@Param('id') id: string, @Body('title') title: string) {
  //   const movie = this.movies.find((m) => m.id === +id);

  //   if (!movie) {
  //     throw new NotFoundException('존재하지 않는 ID의 영화입니다!');
  //   }

  //   Object.assign(movie, { title });

  //   return movie;
  // }

  // @Delete(':id')
  // deleteMovie(@Param('id') id) {
  //   const movieIndex = this.movies.findIndex((m) => m.id === +id);

  //   if (movieIndex === -1) {
  //     throw new NotFoundException('존재하지 않는 ID의 영화입니다!');
  //   }

  //   this.movies.splice(movieIndex, 1);

  //   // 꼭 id를 반환해줄 필요는 없다(정의하기 나름)
  //   return id;
  // }
}

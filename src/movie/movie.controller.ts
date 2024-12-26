import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { MovieService } from './movie.service';

/**
 * Controller: 요청 자체, query, body, param 등에 대한 것만 처리한다
 * Service: 로직을 처리한다
 */
@Controller('movie')
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Get()
  getMovies(@Query('title') title?: string) {
    return this.movieService.getManyMovies(title);
  }

  @Get(':id')
  getMovie(@Param('id') id: string) {
    return this.movieService.getMovieById(+id);
  }

  @Post()
  postMovie(@Body('title') title: string, @Body('genre') genre: string) {
    return this.movieService.createMovie(title, genre);
  }

  @Patch(':id')
  patchMovie(@Param('id') id: string, @Body('title') title: string, @Body('genre') genre: string) {
    return this.movieService.updateMovie(+id, title, genre);
  }

  @Delete(':id')
  deleteMovie(@Param('id') id: string) {
    return this.movieService.deleteMovie(+id);
  }
}

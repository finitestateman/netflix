import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { MovieService } from './movie.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';

/**
 * Controller: 요청 자체, query, body, param 등에 대한 것만 처리한다
 * Service: 로직을 처리한다
 */
@Controller('movie')
@UseInterceptors(ClassSerializerInterceptor)
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Get()
  findAll(@Query('title') title?: string) {
    return this.movieService.findAll(title);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.movieService.findOne(+id);
  }

  // @Post()
  // create(@Body() body: CreateMovieDto) {
  //   return this.movieService.create(body);
  // }

  @Post()
  createUsingQueryBuilder(@Body() body: CreateMovieDto) {
    return this.movieService.createUsingQueryBuilder(body);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() body: UpdateMovieDto) {
  //   return this.movieService.update(+id, body);
  // }

  @Patch(':id')
  updateUsingQueryBuilder(
    @Param('id') id: string,
    @Body() body: UpdateMovieDto,
  ) {
    return this.movieService.updateUsingQueryBuilder(+id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.movieService.remove(+id);
  }
}

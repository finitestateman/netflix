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
  ParseIntPipe,
  HttpStatus,
  BadRequestException,
  ParseArrayPipe,
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

  @Get('array')
  findAllArrayPipe(
    @Query('id', new ParseArrayPipe({ items: Number, separator: ',' }))
    id: number[],
  ) {
    return id;
  }

  @Get(':id')
  // findOne(@Param('id', ParseIntPipe) id: number) {
  findOne(
    @Param(
      'id',
      new ParseIntPipe({
        exceptionFactory: (error) => {
          throw new BadRequestException({
            message: 'id is not a number',
            error,
            statusCode: HttpStatus.BAD_REQUEST,
          });
        },
      }),
    )
    id: number,
  ) {
    return this.movieService.findOne(id);
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

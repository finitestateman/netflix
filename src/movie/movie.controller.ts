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
import { MovieTitleValidationPipeGeneric } from './pipe/movie-title-validation.pipe';
import { Movie } from './entity/movie.entity';

/**
 * Controller: 요청 자체, query, body, param 등에 대한 것만 처리한다
 * Service: 로직을 처리한다
 */
@Controller('movie')
@UseInterceptors(ClassSerializerInterceptor)
export class MovieController {
    public constructor(private readonly movieService: MovieService) {}

    @Get()
    public findAll(
        @Query(
            'title',
            new MovieTitleValidationPipeGeneric<string | string[] | undefined, string>({
                allowNull: true,
            }),
        )
        title?: string,
    ): Promise<[Movie[], number]> {
        return this.movieService.findAll(title);
    }

    @Get('array')
    public findAllArrayPipe(
        @Query('id', new ParseArrayPipe({ items: Number, separator: ',' }))
        id: number[],
    ): Promise<number[]> {
        return new Promise((resolve) => resolve(id));
    }

    @Get(':id')
    // findOne(@Param('id', ParseIntPipe) id: number) {
    public findOne(
        @Param(
            'id',
            new ParseIntPipe({
                exceptionFactory: (error): BadRequestException => {
                    throw new BadRequestException({
                        message: 'id is not a number',
                        error,
                        statusCode: HttpStatus.BAD_REQUEST,
                    });
                },
            }),
        )
        id: number,
    ): Promise<Movie> {
        return this.movieService.findOne(id);
    }

    // @Post()
    // create(@Body() body: CreateMovieDto) {
    //   return this.movieService.create(body);
    // }

    @Post()
    public createUsingQueryBuilder(@Body() body: CreateMovieDto): Promise<Movie> {
        return this.movieService.createUsingQueryBuilder(body);
    }

    // @Patch(':id')
    // update(@Param('id') id: string, @Body() body: UpdateMovieDto) {
    //   return this.movieService.update(+id, body);
    // }

    @Patch(':id')
    public updateUsingQueryBuilder(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: UpdateMovieDto,
    ): Promise<Movie> {
        return this.movieService.updateUsingQueryBuilder(id, body);
    }

    @Delete(':id')
    public remove(@Param('id', ParseIntPipe) id: number): Promise<number> {
        return this.movieService.remove(id);
    }
}

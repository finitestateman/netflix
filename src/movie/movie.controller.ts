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
    UseGuards,
    Request,
} from '@nestjs/common';
import { MovieService } from './movie.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { MovieTitleValidationPipeGeneric } from './pipe/movie-title-validation.pipe';
import { Movie } from './entity/movie.entity';
import { AccessTokenGuard } from 'src/auth/guard/auth.guard';
import { Public } from 'src/auth/decorator/public.decorator';
import { Role } from 'src/user/entities/user.entity';
import { RBAC } from 'src/auth/decorator/rbac.decorator';
import { GetMoviesDto } from './dto/get-movies.dto';
import { CursorPaginationDto } from 'src/common/dto/cursor-pagination.dto';
import { CacheInterceptor } from 'src/common/interceptor/cache.interceptor';
import { QueryRunner } from 'typeorm';
import { Request as ExpressRequest } from 'express';
import { TransactionInterceptor } from 'src/common/interceptor/transaction.interceptor';
/**
 * Controller: 요청 자체, query, body, param 등에 대한 것만 처리한다
 * Service: 로직을 처리한다
 */
@Controller('movie')
@UseInterceptors(ClassSerializerInterceptor)
export class MovieController {
    public constructor(private readonly movieService: MovieService) {}

    @Get()
    @Public()
    // @UseInterceptors(CacheInterceptor)
    public findAll(
        // MovieTitleValidationPipe때문에 @Query()를 둘로 분리한다
        // ! Omit<GetMoviesDto, 'title'>으로 하니까 기본값이 적용이 안 된다
        @Query() dto: GetMoviesDto,
        @Query(
            'title',
            new MovieTitleValidationPipeGeneric<string | string[] | undefined, string>({
                allowNull: true,
            }),
        )
        title?: string,
    ): Promise<{ count: number; movies: Movie[]; nextCursor: string }> {
        return this.movieService.findAllUsingQueryBuilder({ ...dto, title }); // { title, ...dto }로 하면 title이 덮어쓰기돼서 문제가 될 수 있다
    }

    @Get('array')
    @Public()
    public findAllArrayPipe(
        @Query('id', new ParseArrayPipe({ items: Number, separator: ',' }))
        id: number[],
    ): Promise<number[]> {
        return new Promise((resolve) => resolve(id));
    }

    @Get(':id')
    @Public()
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
    @RBAC(Role.admin)
    // @UseGuards(AccessTokenGuard) // 이렇게 개별 설정할 수도 있다(지금은 글로벌 적용되어있어서 가드를 두번 타기 때문에 주석처리함)
    @UseInterceptors(TransactionInterceptor)
    public createUsingQueryBuilder(
        @Body() body: CreateMovieDto,
        @Request() req: ExpressRequest & { queryRunner: QueryRunner },
    ): Promise<Movie> {
        return this.movieService.createUsingQueryBuilder(body, req.queryRunner);
    }

    // @Patch(':id')
    // update(@Param('id') id: string, @Body() body: UpdateMovieDto) {
    //   return this.movieService.update(+id, body);
    // }

    @Patch(':id')
    @RBAC(Role.admin)
    public updateUsingQueryBuilder(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: UpdateMovieDto,
    ): Promise<Movie> {
        return this.movieService.updateUsingQueryBuilder(id, body);
    }

    @Delete(':id')
    @RBAC(Role.admin)
    public remove(@Param('id', ParseIntPipe) id: number): Promise<number> {
        return this.movieService.remove(id);
    }
}

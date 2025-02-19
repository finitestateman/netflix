/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entity/movie.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
    DataSource,
    DeleteResult,
    In,
    InsertResult,
    Like,
    QueryRunner,
    Repository,
    SelectQueryBuilder,
    UpdateResult,
} from 'typeorm';
import { MovieDetail } from './entity/movie-detail.entity';
import { Director } from 'src/director/entity/director.entity';
import { Genre } from 'src/genre/entities/genre.entity';
import { GetMoviesDto } from './dto/get-movies.dto';
import { CommonService } from 'src/common/common.service';

// export 해줘야 Controller에서 쓸 수 있다

@Injectable()
export class MovieService {
    public constructor(
        @InjectRepository(Movie)
        private readonly movieRepository: Repository<Movie>,
        @InjectRepository(MovieDetail)
        private readonly movieDetailRepository: Repository<MovieDetail>,
        /*
    한 서비스에서 다른 서비스를 자체를 주입 받아서 사용해도 된다.
    하지만 강의에선 같은 레이어(service 레이어)끼리는 의존관계를 버리고 repository를 주입받도록 한다
    장단점에 대해선 생각해보기
     */
        // private readonly directorService: DirectorService,
        @InjectRepository(Director)
        private readonly directorRepository: Repository<Director>,
        @InjectRepository(Genre)
        private readonly genreRepository: Repository<Genre>,
        private readonly dataSource: DataSource,
        private readonly commonService: CommonService,
    ) {}

    public async findAll(title?: string): Promise<[Movie[], number]> {
        if (!title) {
            return [
                await this.movieRepository.find({
                    relations: ['director', 'genres'],
                }),
                await this.movieRepository.count(),
            ];
        }

        return this.movieRepository.findAndCount({
            where: {
                title: Like(`%${title}%`),
            },
            relations: ['director', 'genres'],
        });

        // return this.movies.filter((m) => m.title.startsWith(title));
    }

    public async findOne(id: number): Promise<Movie> {
        const movie = await this.movieRepository.findOne({
            where: { id },
            relations: ['detail', 'director', 'genres'],
        });

        if (!movie) {
            // 이렇게 하면 500 이기 때문에 404로 바꿔준다
            // throw new Error('존재하지 않는 ID 값의 영화입니다!');
            throw new NotFoundException('존재하지 않는 ID 값의 영화입니다!');
        }

        return movie;
    }

    public async create(createMovieDto: CreateMovieDto): Promise<Movie> {
        const director = await this.directorRepository.findOne({
            where: { id: createMovieDto.directorId },
        });

        if (!director) {
            throw new NotFoundException('존재하지 않는 ID의 감독입니다!');
        }

        const genres = await this.genreRepository.find({
            where: { id: In(createMovieDto.genreIds) },
        });

        if (genres.length !== createMovieDto.genreIds.length) {
            throw new NotFoundException(
                `존재하지 않는 장르가 있습니다! 존재하는 ids -> ${genres.map((genre) => genre.id).join(',')}`,
            );
        }

        return this.movieRepository.save({
            title: createMovieDto.title,
            detail: {
                description: createMovieDto.description,
            },
            // entity에 class로써 정의되었으므로 directorId가 아니라 director 자체를 전달한다(실제 movie테이블에는 directorId가 저장된다)
            director,
            genres,
        });
    }

    public async createUsingQueryBuilder(createMovieDto: CreateMovieDto, qr: QueryRunner): Promise<Movie> {
        const director = await qr.manager.findOne(Director, {
            where: { id: createMovieDto.directorId },
        });

        if (!director) {
            throw new NotFoundException('존재하지 않는 ID의 감독입니다!');
        }

        const genres = await qr.manager.find(Genre, {
            where: { id: In(createMovieDto.genreIds) },
        });

        if (genres.length !== createMovieDto.genreIds.length) {
            throw new NotFoundException(
                `존재하지 않는 장르가 있습니다! 존재하는 ids -> ${genres.map((genre) => genre.id).join(',')}`,
            );
        }

        const movieDetail: InsertResult = await qr.manager
            .createQueryBuilder()
            .insert()
            .into(MovieDetail)
            .values({ description: createMovieDto.description })
            .execute();

        const movieDetailId = movieDetail.identifiers[0].id as number;

        const movie: InsertResult = await qr.manager
            .createQueryBuilder()
            .insert()
            .into(Movie)
            .values({
                title: createMovieDto.title,
                detail: { id: movieDetailId },
                director,
                // genres, // ? N:M은 그냥 안 된다
            })
            .execute();

        const movieId = movie.identifiers[0].id as number;

        await qr.manager
            .createQueryBuilder()
            .relation(Movie, 'genres')
            .of(movieId)
            .add(genres.map((genre) => genre.id));

        // 여기는 굳이 qr로 바꿀 필요 없다
        // qr.commitTransaction()을 interceptor로 보냈기 때문에 commit은 리턴 이후에 이루어진다
        // 그런데 movieRepository.findOne()을 하면 아직 commit이 안 된 상태기 때문에 DB엔 값이 아직 없어서 빈 값이 반환된다
        // 그렇기 때문에 qr.manager.findOne()을 사용해야 한다
        return qr.manager.findOne(Movie, {
            where: { id: movieId },
            relations: ['detail', 'director', 'genres'],
        });
    }

    public async findAllUsingQueryBuilder(
        { cursor, orders, take, countFirst, title }: GetMoviesDto,
        // title?: string,
    ): Promise<{ count: number; movies: Movie[]; nextCursor: string }> {
        const qb = this.movieRepository
            .createQueryBuilder('movie')
            .leftJoinAndSelect('movie.director', 'director')
            .leftJoinAndSelect('movie.genres', 'genres');

        if (title) {
            qb.where('movie.title LIKE :title', { title: `%${title}%` });
        }

        // this.commonService.applyPagePaginationParamsToQueryBuilder(qb, { page, take });
        const { nextCursor } = await this.commonService.applyCursorPaginationParamsToQueryBuilder<Movie>(qb, {
            cursor,
            orders,
            take,
        });

        const [movies, count] = await qb.getManyAndCount();

        // count는 take한 값이 아니라 페이지가 없다고 가정했을 때의 값이다
        return countFirst ? { count, nextCursor, movies } : { movies, count, nextCursor };
    }

    public async findOneUsingQueryBuilder(id: number): Promise<Movie> {
        const qb = this.movieRepository
            .createQueryBuilder('movie')
            .leftJoinAndSelect('movie.director', 'director')
            .leftJoinAndSelect('movie.genres', 'genres')
            .leftJoinAndSelect('movie.detail', 'detail')
            .where('movie.id = :id', { id });

        const movie = await qb.getOne();

        if (!movie) {
            throw new NotFoundException('존재하지 않는 ID의 영화입니다!');
        }

        return movie;
    }

    public async update(id: number, updateMovieDto: UpdateMovieDto): Promise<Movie> {
        const movie = await this.movieRepository.findOne({
            where: { id },
            relations: ['detail'],
        });

        if (!movie) {
            throw new NotFoundException('존재하지 않는 ID의 영화입니다!');
        }

        const { description, directorId, genreIds, ...partialMovieDto } = updateMovieDto;

        let director: Director;

        if (directorId) {
            director = await this.directorRepository.findOne({
                where: { id: directorId },
            });

            if (!director) {
                throw new NotFoundException('존재하지 않는 ID의 감독입니다');
            }
        }

        const result = await this.movieRepository.update(id, {
            ...partialMovieDto,
            director,
        });

        if (result.affected === 0) {
            // 원래는 try-catch로 추가적인 처리를 해야한다
            // 또 사실 위에서 id 검사를 할 필요가 없고 여기서 처리하면 된다
            throw new NotFoundException('영화 정보가 갱신되지 않았습니다!');
        }

        if (description) {
            const detailResult = await this.movieDetailRepository.update(movie.detail.id, { description });

            if (detailResult.affected === 0) {
                // 원래는 try-catch로 추가적인 처리를 해야한다
                // 또 사실 위에서 id 검사를 할 필요가 없고 여기서 처리하면 된다
                throw new NotFoundException('영화 상세 정보가 갱신되지 않았습니다!');
            }
        }

        let genres: Genre[];

        if (genreIds) {
            genres = await this.genreRepository.find({
                where: { id: In(genreIds) },
            });

            if (genres.length !== updateMovieDto.genreIds.length) {
                throw new NotFoundException(
                    `존재하지 않는 장르가 있습니다! 존재하는 id: [${genres.map((genre) => genre.id).join(',')}]`,
                );
            }
        }

        // 업데이트된 영화 정보를 반환하기 위해 한번 더 조회
        const updatedMovie = await this.movieRepository.findOne({
            where: { id },
            relations: ['detail', 'director'],
        });

        updatedMovie.genres = genres;
        await this.movieRepository.save(updatedMovie);

        return this.movieRepository.findOne({
            where: { id },
            relations: ['detail', 'director', 'genres'],
        });
    }

    public async updateUsingQueryBuilder(id: number, updateMovieDto: UpdateMovieDto): Promise<Movie> {
        const qr = this.dataSource.createQueryRunner();

        await qr.connect();
        await qr.startTransaction();

        try {
            const movie = await qr.manager.findOne(Movie, {
                where: { id },
                relations: ['detail', 'genres'],
            });

            if (!movie) {
                throw new NotFoundException('존재하지 않는 ID의 영화입니다!');
            }

            const { description, directorId, genreIds, ...partialMovieDto } = updateMovieDto;

            let director: Director;

            if (directorId) {
                director = await qr.manager.findOne(Director, {
                    where: { id: directorId },
                });

                if (!director) {
                    throw new NotFoundException('존재하지 않는 ID의 감독입니다');
                }
            }

            const result: UpdateResult = await qr.manager
                .createQueryBuilder(Movie, 'movie')
                .update(Movie)
                .set({
                    ...partialMovieDto,
                    director,
                })
                .where('id = :id', { id })
                .execute();

            if (description) {
                const detailResult: UpdateResult = await qr.manager
                    .createQueryBuilder(MovieDetail, 'movieDetail')
                    .update(MovieDetail)
                    .set({ description })
                    .where('id = :id', { id: movie.detail.id })
                    .execute();
            }

            let genres: Genre[];
            if (genreIds) {
                genres = await qr.manager.find(Genre, {
                    where: { id: In(genreIds) },
                });

                if (genres.length !== genreIds.length) {
                    throw new NotFoundException(
                        `존재하지 않는 장르가 있습니다! 존재하는 id: [${genres.map((genre) => genre.id).join(',')}]`,
                    );
                }

                await qr.manager
                    .createQueryBuilder(Movie, 'movie')
                    .relation(Movie, 'genres')
                    .of(id)
                    .addAndRemove(
                        genreIds,
                        movie.genres.map((genre) => genre.id),
                    );
            }

            await qr.commitTransaction();

            return this.movieRepository.findOne({
                where: { id },
                relations: ['detail', 'director', 'genres'],
            });
        } catch (error) {
            await qr.rollbackTransaction();
            throw error;
        } finally {
            await qr.release();
        }
    }

    public async remove(id: number): Promise<number> {
        const movie = await this.movieRepository.findOne({
            where: { id },
            relations: ['detail'],
        });

        if (!movie) {
            throw new NotFoundException('존재하지 않는 ID의 영화입니다!');
        }

        const result = await this.movieRepository.delete(id);

        if (result.affected === 0) {
            // 원래는 try-catch로 추가적인 처리를 해야한다
            // 또 사실 위에서 id 검사를 할 필요가 없고 여기서 처리하면 된다
            throw new NotFoundException('영화 정보가 삭제되지 않았습니다!');
        }

        const detailResult = await this.movieDetailRepository.delete(movie.detail.id);

        if (detailResult.affected === 0) {
            // 원래는 try-catch로 추가적인 처리를 해야한다
            // 또 사실 위에서 id 검사를 할 필요가 없고 여기서 처리하면 된다
            throw new NotFoundException('영화 상세 정보가 삭제되지 않았습니다!');
        }

        // 꼭 id를 반환해줄 필요는 없다(정의하기 나름)
        return id;
    }

    public async removeUsingQueryBuilder(id: number): Promise<number> {
        const movie = await this.movieRepository.findOne({
            where: { id },
            relations: ['detail'],
        });

        if (!movie) {
            throw new NotFoundException('존재하지 않는 ID의 영화입니다!');
        }

        const result: DeleteResult = await this.movieRepository
            .createQueryBuilder()
            .delete()
            .from(Movie)
            .where('id = :id', { id })
            .execute();

        const detailResult = await this.movieDetailRepository.delete(movie.detail.id);

        return id;
    }
}

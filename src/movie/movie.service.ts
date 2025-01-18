import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entity/movie.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository, UpdateResult } from 'typeorm';
import { MovieDetail } from './entity/movie-detail.entity';
import { Director } from 'src/director/entity/director.entity';
import { Genre } from 'src/genre/entities/genre.entity';

// export 해줘야 Controller에서 쓸 수 있다

@Injectable()
export class MovieService {
  constructor(
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
  ) {}

  async findAll(title?: string) {
    if (!title) {
      return [
        await this.movieRepository.find({ relations: ['director', 'genres'] }),
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

  async findOne(id: number) {
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

  async create(createMovieDto: CreateMovieDto) {
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

    return await this.movieRepository.save({
      title: createMovieDto.title,
      detail: {
        description: createMovieDto.description,
      },
      // entity에 class로써 정의되었으므로 directorId가 아니라 director 자체를 전달한다(실제 movie테이블에는 directorId가 저장된다)
      director,
      genres,
    });
  }

  async update(id: number, updateMovieDto: UpdateMovieDto) {
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

    const detailResult = await this.movieDetailRepository.update(
      movie.detail.id,
      { description },
    );

    if (detailResult.affected === 0) {
      // 원래는 try-catch로 추가적인 처리를 해야한다
      // 또 사실 위에서 id 검사를 할 필요가 없고 여기서 처리하면 된다
      throw new NotFoundException('영화 상세 정보가 갱신되지 않았습니다!');
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

  async remove(id: number) {
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

    const detailResult = await this.movieDetailRepository.delete(
      movie.detail.id,
    );

    if (detailResult.affected === 0) {
      // 원래는 try-catch로 추가적인 처리를 해야한다
      // 또 사실 위에서 id 검사를 할 필요가 없고 여기서 처리하면 된다
      throw new NotFoundException('영화 상세 정보가 삭제되지 않았습니다!');
    }

    // 꼭 id를 반환해줄 필요는 없다(정의하기 나름)
    return id;
  }
}

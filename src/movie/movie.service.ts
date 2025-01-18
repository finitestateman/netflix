import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entity/movie.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository, UpdateResult } from 'typeorm';
import { MovieDetail } from './entity/movie-detail.entity';
import { DirectorService } from 'src/director/director.service';

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
    private readonly directorService: DirectorService,
  ) {}

  async findAll(title?: string) {
    if (!title) {
      return [
        await this.movieRepository.find(),
        await this.movieRepository.count(),
      ];
    }

    return this.movieRepository.findAndCount({
      where: {
        title: Like(`%${title}%`),
      },
    });

    // return this.movies.filter((m) => m.title.startsWith(title));
  }

  async findOne(id: number) {
    const movie = await this.movieRepository.findOne({
      where: { id },
      relations: ['detail'],
    });

    if (!movie) {
      // 이렇게 하면 500 이기 때문에 404로 바꿔준다
      // throw new Error('존재하지 않는 ID 값의 영화입니다!');
      throw new NotFoundException('존재하지 않는 ID 값의 영화입니다!');
    }

    return movie;
  }

  async create(createMovieDto: CreateMovieDto) {
    return await this.movieRepository.save({
      title: createMovieDto.title,
      genre: createMovieDto.genre,
      detail: {
        description: createMovieDto.description,
      },
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

    const { description, ...partialMovieDto } = updateMovieDto;

    const result = await this.movieRepository.update(id, partialMovieDto);

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

    // 업데이트된 영화 정보를 반환하기 위해 한번 더 조회
    return await this.movieRepository.findOne({
      where: { id },
      relations: ['detail'],
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

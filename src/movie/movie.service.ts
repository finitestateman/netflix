import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entity/movie.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository, UpdateResult } from 'typeorm';

// export 해줘야 Controller에서 쓸 수 있다

@Injectable()
export class MovieService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
  ) {}

  async getManyMovies(title?: string) {
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

  async getMovieById(id: number) {
    const movie = await this.movieRepository.findOne({
      where: { id },
    });

    if (!movie) {
      // 이렇게 하면 500 이기 때문에 404로 바꿔준다
      // throw new Error('존재하지 않는 ID 값의 영화입니다!');
      throw new NotFoundException('존재하지 않는 ID 값의 영화입니다!');
    }

    return movie;
  }

  async createMovie(createMovieDto: CreateMovieDto) {
    return await this.movieRepository.save(createMovieDto);
  }

  async updateMovie(id: number, updateMovieDto: UpdateMovieDto) {
    const movie = await this.movieRepository.findOne({
      where: { id },
    });

    if (!movie) {
      throw new NotFoundException('존재하지 않는 ID의 영화입니다!');
    }

    const result = await this.movieRepository.update(id, updateMovieDto);

    if (result.affected === 0) {
      // 원래는 try-catch로 추가적인 처리를 해야한다
      // 또 사실 위에서 id 검사를 할 필요가 없고 여기서 처리하면 된다
      throw new NotFoundException('아무 변경사항이 일어나지 않았습니다!');
    }

    // 업데이트된 영화 정보를 반환하기 위해 한번 더 조회
    return await this.movieRepository.findOne({
      where: { id },
    });
  }

  async deleteMovie(id: number) {
    const movie = await this.movieRepository.findOne({
      where: { id },
    });

    if (!movie) {
      throw new NotFoundException('존재하지 않는 ID의 영화입니다!');
    }

    const result = await this.movieRepository.delete(id);

    if (result.affected === 0) {
      // 원래는 try-catch로 추가적인 처리를 해야한다
      // 또 사실 위에서 id 검사를 할 필요가 없고 여기서 처리하면 된다
      throw new NotFoundException('아무 변경사항이 일어나지 않았습니다!');
    }

    // 꼭 id를 반환해줄 필요는 없다(정의하기 나름)
    return id;
  }
}

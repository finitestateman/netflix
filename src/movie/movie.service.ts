import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';

// export 해줘야 Controller에서 쓸 수 있다
export interface Movie {
  id: number;
  title: string;
  genre: string;
}

@Injectable()
export class MovieService {
  private movies: Movie[] = [
    {
      id: 1,
      title: '해리포터',
      genre: 'fantasy',
    },
    {
      id: 2,
      title: '반지의 제왕',
      genre: 'action',
    },
  ];

  private idCounter = 3;

  getManyMovies(title?: string) {
    if (!title) {
      return this.movies;
    }

    return this.movies.filter((m) => m.title.startsWith(title));
  }

  getMovieById(id: number) {
    const movie = this.movies.find((m) => m.id === +id);

    if (!movie) {
      // 이렇게 하면 500 이기 때문에 404로 바꿔준다
      // throw new Error('존재하지 않는 ID 값의 영화입니다!');
      throw new NotFoundException('존재하지 않는 ID 값의 영화입니다!');
    }

    return movie;
  }

  createMovie(createMovieDto: CreateMovieDto) {
    const movie: Movie = {
      id: this.idCounter++,
      ...createMovieDto,
    };

    this.movies.push(movie);

    // 다른 건 몰라도 id값은 클라이언트에게 넘겨줘야 한다
    return movie;
  }

  updateMovie(id: number, updateMovieDto: UpdateMovieDto) {
    const movie = this.movies.find((m) => m.id === +id);

    if (!movie) {
      throw new NotFoundException('존재하지 않는 ID의 영화입니다!');
    }

    Object.assign(movie, updateMovieDto);

    return movie;
  }

  deleteMovie(id: number) {
    const movieIndex = this.movies.findIndex((m) => m.id === +id);

    if (movieIndex === -1) {
      throw new NotFoundException('존재하지 않는 ID의 영화입니다!');
    }

    this.movies.splice(movieIndex, 1);

    // 꼭 id를 반환해줄 필요는 없다(정의하기 나름)
    return id;
  }
}

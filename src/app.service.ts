import { Injectable, NotFoundException } from '@nestjs/common';

// export 해줘야 Controller에서 쓸 수 있다
export interface Movie {
  id: number;
  title: string;
}

@Injectable()
export class AppService {
  private movies: Movie[] = [
    {
      id: 1,
      title: '해리포터',
    },
    {
      id: 2,
      title: '반지의 제왕',
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
}

import { IsNotEmpty } from 'class-validator';

export class CreateMovieDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  genre: string;

  // ! 강의 상에서는 변수명이 detail
  @IsNotEmpty()
  description: string;

  // movie.entity.detail.description 구조이기 때문에 아래처럼 받아야한다고 생각할 수 있지만 프런트 입장에서 좋지 않다
  /**
  detail: {
    description: string;
  };
   */
}

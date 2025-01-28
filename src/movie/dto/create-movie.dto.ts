import { ArrayNotEmpty, IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateMovieDto {
    @IsNotEmpty()
    @IsString()
    public title: string;

    // ! 강의 상에서는 변수명이 detail
    @IsNotEmpty()
    @IsString()
    public description: string;

    // movie.entity.detail.description 구조이기 때문에 아래처럼 받아야한다고 생각할 수 있지만 프런트 입장에서 좋지 않다
    /**
  detail: {
    description: string;
  };
   */

    @IsNotEmpty()
    @IsNumber()
    public directorId: number;

    @IsArray()
    @ArrayNotEmpty()
    @IsNumber(
        {
            /* IsNumber 고유의 옵션 */
        },
        {
            each: true,
        },
    )
    public genreIds: number[];
}

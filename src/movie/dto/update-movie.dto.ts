import { ArrayNotEmpty, IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateMovieDto {
  @IsNotEmpty() // 값이 있을 때 빈 문자열이면 안 된다
  @IsString()
  @IsOptional() // 값이 선택적
  title?: string;

  @IsNotEmpty()
  @IsOptional()
  description?: string;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  directorId?: number;

  @IsArray()
  @ArrayNotEmpty()
  @IsNumber(
    {},
    {
      each: true,
    },
  )
  @IsOptional()
  genreIds?: number[];
}

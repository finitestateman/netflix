import { PartialType } from '@nestjs/mapped-types';
import { CreateMovieDto } from './create-movie.dto';

export class UpdateMovieDto extends PartialType(CreateMovieDto) {}

// @IsNotEmpty() // 값이 있을 때 빈 문자열이면 안 된다
// @IsString()
// @IsOptional() // 값이 선택적
// public title?: string;

// @IsNotEmpty()
// @IsOptional()
// public description?: string;

// @IsNotEmpty()
// @IsString()
// @IsOptional()
// public directorId?: number;

// @IsArray()
// @ArrayNotEmpty()
// @IsNumber(
//     {},
//     {
//         each: true,
//     },
// )
// @IsOptional()
// public genreIds?: number[];

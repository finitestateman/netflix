import { ArrayNotEmpty, IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateMovieDto {
    @IsNotEmpty() // 값이 있을 때 빈 문자열이면 안 된다
    @IsString()
    @IsOptional() // 값이 선택적
    public title?: string;

    @IsNotEmpty()
    @IsOptional()
    public description?: string;

    @IsNotEmpty()
    @IsString()
    @IsOptional()
    public directorId?: number;

    @IsArray()
    @ArrayNotEmpty()
    @IsNumber(
        {},
        {
            each: true,
        },
    )
    @IsOptional()
    public genreIds?: number[];
}

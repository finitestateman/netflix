import { IsNotEmpty, IsString } from 'class-validator';

export class CreateGenreDto {
    @IsNotEmpty()
    @IsString()
    public name: string;
}

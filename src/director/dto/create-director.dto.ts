import { Transform } from 'class-transformer';
import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CreateDirectorDto {
    @IsNotEmpty()
    @IsString()
    public name: string;

    @IsNotEmpty()
    @Transform(({ value }: { value: string }): Date => new Date(value))
    public dob: Date;

    @IsNotEmpty()
    @IsString()
    public nationality: string;
}

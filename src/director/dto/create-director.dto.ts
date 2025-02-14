import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CreateDirectorDto {
    @IsNotEmpty()
    @IsString()
    public name: string;

    @IsNotEmpty()
    @IsDateString()
    public dob: Date;

    @IsNotEmpty()
    @IsString()
    public nationality: string;
}

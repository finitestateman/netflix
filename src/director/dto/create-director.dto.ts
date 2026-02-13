import { IsDate, IsNotEmpty, IsString } from 'class-validator';

export class CreateDirectorDto {
    @IsNotEmpty()
    @IsString()
    public name: string;

    @IsNotEmpty()
    @IsDate()
    public dob: Date;

    @IsNotEmpty()
    @IsString()
    public nationality: string;
}

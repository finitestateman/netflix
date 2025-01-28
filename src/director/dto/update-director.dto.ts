import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateDirectorDto {
    @IsNotEmpty()
    @IsString()
    @IsOptional()
    public name?: string;

    @IsNotEmpty()
    @IsDateString()
    @IsOptional()
    public dob?: Date;

    @IsNotEmpty()
    @IsString()
    @IsOptional()
    public nationality?: string;
}

import { PartialType } from '@nestjs/mapped-types';
import { CreateDirectorDto } from './create-director.dto';

export class UpdateDirectorDto extends PartialType(CreateDirectorDto) {}

// export class UpdateDirectorDto {
//     @IsNotEmpty()
//     @IsString()
//     @IsOptional()
//     public name?: string;

//     @IsNotEmpty()
//     @IsDateString()
//     @IsOptional()
//     public dob?: Date;

//     @IsNotEmpty()
//     @IsString()
//     @IsOptional()
//     public nationality?: string;
// }

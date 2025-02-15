import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { CursorPaginationDto } from 'src/common/dto/cursor-pagination.dto';

export class GetMoviesDto extends CursorPaginationDto {
    @IsString()
    @IsOptional()
    public title?: string;

    @IsBoolean()
    @IsOptional()
    // globalPipe의 implicitConversion: true에 의해 값이 있으면 무조건 true가 돼버려서 implicitConversion: false로 끄는 게 좋다
    public countFirst?: boolean = false;
}

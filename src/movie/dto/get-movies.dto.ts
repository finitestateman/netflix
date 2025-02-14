import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { PagePaginationDto } from 'src/common/dto/page-pagination.dto';

export class GetMoviesDto extends PagePaginationDto {
    @IsString()
    @IsOptional()
    public title?: string;

    @IsBoolean()
    @IsOptional()
    // globalPipe의 implicitConversion: true에 의해 값이 있으면 무조건 true가 돼버려서 implicitConversion: false로 끄는 게 좋다
    public countFirst?: boolean = false;
}

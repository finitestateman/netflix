import { IsInt, IsOptional, IsPositive } from 'class-validator';

// main.ts에 적용된 transformOptions: { enableImplicitConversion: true } 때문에 자동으로 숫자로 변환된다
// 아니면 각 필드에 @Transform 사용하거나 Pipe
export class PagePaginationDto {
    @IsInt()
    @IsPositive()
    @IsOptional()
    public page: number = 1;

    @IsInt()
    @IsPositive()
    @IsOptional()
    public take: number = 5;
}

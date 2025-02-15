import { IsIn, IsInt, IsNumber, IsOptional, IsPositive } from 'class-validator';

const ORDER = ['ASC', 'DESC'] as const;
type Order = (typeof ORDER)[number];

export class CursorPaginationDto {
    @IsNumber()
    @IsPositive()
    @IsOptional()
    public id?: number;

    @IsIn(ORDER)
    @IsOptional()
    // order? 로 안 하는 이유는 기본값이 있기 때문에(엄밀히는 order?로 하면 안 된다)
    public order: Order = 'DESC';

    @IsInt()
    @IsPositive()
    @IsOptional()
    public take: number = 5;
}

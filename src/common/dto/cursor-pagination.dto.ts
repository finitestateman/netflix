import { IsArray, IsBase64, IsInt, IsOptional, IsPositive, IsString } from 'class-validator';

export class CursorPaginationDto {
    @IsBase64()
    @IsOptional()
    // id_52, likeCount_20
    public cursor?: string;

    // http 요청 시에 이름을 orders[]로 주면 orders 값이 하나이더라도 배열로 전달할 수 있다
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    // id_ASC, id_DESC
    // ['id_DESC', 'likeCount_ASC']
    // 배열이어서 복수형으로 변경
    // Optional Property로 안 하는 이유는 기본값이 있기 때문에(엄밀히는 Optional Property로 하면 안 된다)
    public orders: string[] = ['id_DESC'];

    @IsInt()
    @IsPositive()
    @IsOptional()
    public take: number = 5;
}

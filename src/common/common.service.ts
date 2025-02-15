import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SelectQueryBuilder } from 'typeorm';
import { CursorPaginationDto } from './dto/cursor-pagination.dto';
import { PagePaginationDto } from './dto/page-pagination.dto';

@Injectable()
export class CommonService {
    public constructor(private readonly configService: ConfigService) {}

    public applyPagePaginationParamsToQueryBuilder<T>(
        qb: SelectQueryBuilder<T>,
        { page, take }: PagePaginationDto,
    ): void {
        qb.skip((page - 1) * take).take(take);
    }

    public applyCursorPaginationParamsToQueryBuilder<T>(
        qb: SelectQueryBuilder<T>,
        { id, order, take }: CursorPaginationDto,
    ): void {
        if (id) {
            const direction = order === 'ASC' ? '>' : '<';
            // order: ASC -> movie.id > :id
            // order: DESC -> movie.id < :id
            // ! where이 아니라 andWhere을 써야 기존의 where절을 덮어쓰지 않는다
            qb.andWhere(`${qb.alias}.id ${direction} :id`, { id });
        }

        // order by와 take의 순서가 바뀌면 안 된다
        qb.orderBy(`${qb.alias}.id`, order);
        qb.take(take);
    }
}

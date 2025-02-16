import { BadRequestException, Injectable, NotImplementedException } from '@nestjs/common';
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
        { cursor, orders, take }: CursorPaginationDto,
    ): void {
        if (cursor) {
            throw new NotImplementedException('Not implemented');
        }

        // orders: ['likeCount_DESC', 'id_DESC']
        orders.forEach((order) => {
            const [column, direction] = order.split('_');
            if (!(direction === 'ASC' || direction === 'DESC')) {
                throw new BadRequestException('Order는 ASC 또는 DESC으로 입력해주세요!');
            }

            // column이름을 클라이언트가 입력하게 하므로 오타 위험이 있고 별 상관없어 보이는 databaseName 오류가 발생한다
            // TypeError: Cannot read properties of undefined (reading 'databaseName')

            // 강의에선 아래처럼 분기를 나눴지만
            // if (index === 1) qb.orderBy() else qb.addOrderBy()
            // 그냥 처음부터 qb.addOrderBy()해도 알아서 처리된다
            // 그리고 오히려 addOrderBy가 안전한 게 qb에 이미 orderBy가 적용되어있었다면 orderBy는 기존 orderBy를 덮어써버린다
            qb.addOrderBy(`${qb.alias}.${column}`, direction);
        });

        qb.take(take);
    }
}

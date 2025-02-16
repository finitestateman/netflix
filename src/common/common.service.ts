import { BadRequestException, Injectable, NotImplementedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SelectQueryBuilder } from 'typeorm';
import { CursorPaginationDto } from './dto/cursor-pagination.dto';
import { PagePaginationDto } from './dto/page-pagination.dto';

type CursorValues<T> = Partial<Record<keyof T, T[keyof T]>>;

@Injectable()
export class CommonService {
    public constructor(private readonly configService: ConfigService) {}

    public applyPagePaginationParamsToQueryBuilder<T>(
        qb: SelectQueryBuilder<T>,
        { page, take }: PagePaginationDto,
    ): void {
        qb.skip((page - 1) * take).take(take);
    }

    public async applyCursorPaginationParamsToQueryBuilder<T>(
        qb: SelectQueryBuilder<T>,
        { cursor, orders, take }: CursorPaginationDto,
    ): Promise<{ qb: SelectQueryBuilder<T>; nextCursor: string | null }> {
        if (cursor) {
            // {
            //     values: { id: 27 },
            //     orders: ['id_DESC']
            // }
            const decodedCursor = Buffer.from(cursor, 'base64').toString('utf-8');
            // class-valiator, zod, json-schema, joi
            const { values, orders }: { values: CursorValues<T>; orders: string[] } = JSON.parse(decodedCursor);

            // (movie.col1, movie.col2, movie.col3) > (:val1, :val2, :val3)
            const columns = Object.keys(values);
            // orders는 사용자 입력을 무시하고 cursor에 저장된 값을 사용한다
            // some을 사용했기 때문에 모두 DESC이거나 모두 ASC인 경우만  처리 가능
            const comparisonOperator = orders.some((order) => order.endsWith('DESC')) ? '<' : '>';
            // postgres에서 likeCount를 "likeCount"로 써야해서 큰따옴표로 감쌌다
            const whereConditions = columns.map((column) => `${qb.alias}."${column}"`).join(',');
            const whereParams = columns.map((column) => `:${column}`).join(',');

            qb.andWhere(`(${whereConditions}) ${comparisonOperator} (${whereParams})`, values);
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

        const results: T[] = await qb.getMany();
        const nextCursor: string | null = this.generateNextCursor(results, orders);

        return { qb, nextCursor };
    }

    /**
     * Returns: base64 encoded cursor string
     * {
     *     values: { id: 27 },
     *     orders: ['id_DESC']
     * }
     */
    public generateNextCursor<T>(results: T[], orders: string[]): string | null {
        if (!results.length) return null;

        // 타입을 정의하긴 했지만 정작 런타임에 잡아내진 못한다
        // T 객체의 모든 프로퍼티(keyof T)를 키로 하고, 해당 프로퍼티의 타입(T[keyof T])을 값으로 가지는 객체 타입(Record<K, V>)을 정의하고 프로퍼티를 선택적(Partial)으로 한다
        const values: CursorValues<T> = {};

        orders.forEach((order) => {
            const [column] = order.split('_') as [keyof T, string];
            values[column] = results.at(-1)[column];
        });

        const cursorObj = { values, orders };

        const nextCursorString = Buffer.from(JSON.stringify(cursorObj)).toString('base64');
        return nextCursorString;
    }
}

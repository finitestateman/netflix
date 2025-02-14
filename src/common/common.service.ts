import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SelectQueryBuilder } from 'typeorm';
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
}

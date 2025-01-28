import { Exclude } from 'class-transformer';
import { CreateDateColumn, UpdateDateColumn, VersionColumn } from 'typeorm';

/**
 * @Exclude: 직렬화(serialization)에서 제외
 * { select: false }: DB 쿼리에서 제외
 * 백엔드에서 해당 필드를 사용하지 않는다면 쿼리할 필요도 없다
 */
@Exclude()
export abstract class BaseTable {
    @CreateDateColumn({ select: false })
    public createdAt: Date;

    @UpdateDateColumn({ select: false })
    public updatedAt: Date;

    @VersionColumn({ select: false })
    public version: number;
}

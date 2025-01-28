import { CreateDateColumn, UpdateDateColumn, VersionColumn } from 'typeorm';

export abstract class BaseTable {
    @CreateDateColumn()
    public createdAt: Date;

    @UpdateDateColumn()
    public updatedAt: Date;

    @VersionColumn()
    public version: number;
}

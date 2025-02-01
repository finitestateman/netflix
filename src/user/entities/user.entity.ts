import { BaseTable } from 'src/common/entity/base-table.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum Role {
    admin,
    paidUser,
    user,
}

@Entity()
export class User extends BaseTable {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ unique: true })
    public email: string;

    @Column()
    public password: string;

    @Column({ enum: Role, default: Role.user })
    public role: Role;
}

import { Exclude } from 'class-transformer';
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
    /**
     * toPlainOnly: true -> 직렬화(serialization)에서 제외
     * toClassOnly: true -> 역직렬화(deserialization)에서 제외
     */
    @Exclude({ toPlainOnly: true })
    public password: string;

    // type: enum을 지정하지 않았으므로 enum의 값인 number | string이 컬럼타입이 된다
    @Column({ enum: Role, default: Role.user })
    public role: Role;
}

import { BaseTable } from 'src/common/entity/base-table.entity';
import { Movie } from 'src/movie/entity/movie.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Director extends BaseTable {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column()
    public name: string;

    @Column()
    public dob: Date;

    @Column()
    public nationality: string;

    @OneToMany(() => Movie, (movie) => movie.director)
    public movies: Movie[];
}

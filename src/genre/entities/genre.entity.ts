import { BaseTable } from 'src/common/entity/base-table.entity';
import { Movie } from 'src/movie/entity/movie.entity';
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Genre extends BaseTable {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({
        unique: true,
    })
    public name: string;

    @ManyToMany(() => Movie, (movie) => movie.genres)
    public movies: Movie[];
}

import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Movie } from './movie.entity';

@Entity()
export class MovieDetail {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column()
    public description: string;

    @OneToOne(() => Movie, (movie) => movie.id)
    public movie: Movie;
}

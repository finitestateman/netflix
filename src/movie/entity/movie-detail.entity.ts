import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Movie } from './movie.entity';

@Entity()
export class MovieDetail {
  @PrimaryGeneratedColumn()
  id: number;

  // ! 강의 상에서는 변수명이 detail
  @Column()
  description: string;

  @OneToOne(() => Movie)
  movie: Movie;
}

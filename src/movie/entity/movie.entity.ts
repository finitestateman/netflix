import { Exclude, Expose, Transform } from 'class-transformer';
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn, VersionColumn } from 'typeorm';
import { BaseTable } from '../../common/entity/base-table.entity';
import { MovieDetail } from './movie-detail.entity';
import { Director } from 'src/director/entity/director.entity';

// ManyToOne: Director -> 감독은  여러개의 영화를 제작 가능
// OneToOne: MovieDetail -> 영화는 하나의 상세 내용을 가짐
// ManyToMany: Genre -> 영화는 여러 개의 장르를 가질 수 있고 장르는 여러 개의 영화에 속할 수 있음

// @Exclude()
@Entity()
/* 상속 시 당연하지만 Entity Embedding과는 다르게 plain 하게 응답된다 */
export class Movie extends BaseTable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
  })
  title: string;

  // @Expose() // class 단위에 Exclude를 사용한 경우 각 필드에 대해 Expose를 사용할 수 있다
  // @Exclude()
  // @Transform(({ value }) => value.toString().toUpperCase())
  @Column()
  genre: string;

  @OneToOne(() => MovieDetail, (movieDetail) => movieDetail.id, {
    cascade: true, // movie에 대한 작업이 detail에 영향을 미치게 한다
    nullable: false,
  })
  @JoinColumn()
  detail: MovieDetail;

  // 객체 임베딩 시 응답도 객체 형식으로 반환된다
  /**
    "base": {
      "createdAt": "2024-12-29T15:26:48.811Z",
      "updatedAt": "2024-12-29T15:26:48.811Z",
      "version": 1
  }
   */
  // @Column(() => BaseEntity)
  // base: BaseEntity;

  // @Expose() // 메서드에 대해서도 적용할 수 있다
  // get custom() {
  //   return `title: ${this.title}, genre: ${this.genre}`;
  // }

  @ManyToOne(() => Director, (director) => director.id, {
    cascade: true,
    nullable: false,
  })
  director: Director;
}

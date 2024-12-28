import { Exclude, Expose, Transform } from 'class-transformer';
import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, VersionColumn } from 'typeorm';

// @Exclude()
@Entity()
export class Movie {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  // @Expose() // class 단위에 Exclude를 사용한 경우 각 필드에 대해 Expose를 사용할 수 있다
  // @Exclude()
  // @Transform(({ value }) => value.toString().toUpperCase())
  @Column()
  genre: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @VersionColumn()
  version: number;

  // soft delete인 경우 필요
  // @DeleteDateColumn()
  // deletedAt: Date;

  // @Expose() // 메서드에 대해서도 적용할 수 있다
  // get custom() {
  //   return `title: ${this.title}, genre: ${this.genre}`;
  // }
}

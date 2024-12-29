import { Exclude, Expose, Transform } from 'class-transformer';
import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, VersionColumn } from 'typeorm';

export class BaseEntity {
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @VersionColumn()
  version: number;

  // soft delete인 경우 필요
  // @DeleteDateColumn()
  // deletedAt: Date;
}

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

  // 객체 임베딩 시 응답도 객체 형식으로 반환된다
  /**
    "base": {
      "createdAt": "2024-12-29T15:26:48.811Z",
      "updatedAt": "2024-12-29T15:26:48.811Z",
      "version": 1
  }
   */
  @Column(() => BaseEntity)
  base: BaseEntity;

  // @Expose() // 메서드에 대해서도 적용할 수 있다
  // get custom() {
  //   return `title: ${this.title}, genre: ${this.genre}`;
  // }
}

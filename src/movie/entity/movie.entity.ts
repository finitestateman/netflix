import { Exclude, Expose, Transform } from 'class-transformer';
import { ChildEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, TableInheritance, UpdateDateColumn, VersionColumn } from 'typeorm';

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

// Single Table Inheritance: 공통되는 속성이 존재하는 Entity들을 한 테이블로 다룬다
// Content: Movie || Series
// Movie: runtime
// Series: seriesCount
@Entity()
@TableInheritance({
  column: {
    type: 'varchar',
    name: 'type',
  },
})
export class Content extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  genre: string;
}

// @Exclude()
@ChildEntity()
/* 상속 시 당연하지만 Entity Embedding과는 다르게 plain 하게 응답된다 */
export class Movie extends Content {
  @Column()
  runtime: number;

  // @Expose() // 메서드에 대해서도 적용할 수 있다
  // get custom() {
  //   return `title: ${this.title}, genre: ${this.genre}`;
  // }
}

@ChildEntity()
export class Series extends Content {
  @Column()
  seriesCount: number;
}

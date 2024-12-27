import { Exclude, Expose } from 'class-transformer';

// @Exclude()
export class Movie {
  id: number;

  title: string;

  // @Expose() // class 단위에 Exclude를 사용한 경우 각 필드에 대해 Expose를 사용할 수 있다
  // @Exclude()
  genre: string;

  // @Expose() // 메서드에 대해서도 적용할 수 있다
  // get custom() {
  //   return `title: ${this.title}, genre: ${this.genre}`;
  // }
}

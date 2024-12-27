import {
  Contains,
  Equals,
  IsAlphanumeric,
  IsArray,
  IsBoolean,
  IsCreditCard,
  IsDate,
  IsDateString,
  IsDefined,
  IsDivisibleBy,
  IsEmpty,
  IsEnum,
  IsHexColor,
  IsIn,
  IsInt,
  IsLatLong,
  IsNotEmpty,
  IsNotIn,
  IsNumber,
  IsOptional,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
  NotContains,
  NotEquals,
} from 'class-validator';

enum MovieGenre {
  Fantasy = 'fantasy',
  Action = 'action',
}

export class UpdateMovieDto {
  @IsNotEmpty() // 값이 있을 때 빈 문자열이면 안 된다
  @IsOptional() // 값이 선택적
  title?: string;

  @IsNotEmpty()
  @IsOptional()
  genre?: string;

  // @IsDefined() // null || undefined (비허용)
  // @IsOptional()
  // @Equals('code factory')
  // @NotEquals('code factory')
  // @IsEmpty() // null || undefined || '' 만 허용(' ' 비허용)
  // @IsNotEmpty() // IsDefined || ''
  // @IsIn(['action', 'fantasy'])
  // @IsNotIn(['romance'])
  // @IsBoolean()
  // @IsNumber()
  // @IsInt()
  // @IsArray()
  // @IsEnum(MovieGenre)
  // @IsDate() // 실제 날짜 객체여야 함
  // @IsDateString() // 날짜 형식의 문자열
  // @IsDivisibleBy(5)
  // @Max(100) // @Min(50)
  // @Contains('code factory')
  // @NotContains('code factory')
  // @IsAlphanumeric()
  // @IsCreditCard()
  // @IsHexColor()
  // @MaxLength(10)
  // @MinLength(5)
  // @IsUUID()
  // @IsLatLong()
  test: string;
}

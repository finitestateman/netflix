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
  registerDecorator,
  Validate,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

enum MovieGenre {
  Fantasy = 'fantasy',
  Action = 'action',
}

// @ValidatorConstraint()
@ValidatorConstraint({ async: true }) // async로 하여 비동기로 validation을 수행할 수 있다(네트워크, DB 등)
class PasswordValidator implements ValidatorConstraintInterface {
  validate(
    value: any,
    validationArguments?: ValidationArguments,
  ): Promise<boolean> | boolean {
    // 비밀번호 길이는 4-8
    return value.length > 4 && value.length < 8;
  }
  defaultMessage?(validationArguments?: ValidationArguments): string {
    return '비밀번호의 길이는 4-8자 여야합니다. 입력된 비밀번호: ($value)';
  }
}

function IsPasswordValid(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor, // 문제가 발생할 객체에 대한 constructor
      propertyName,
      options: validationOptions,
      validator: PasswordValidator,
    });
  };
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
  // @Validate(PasswordValidator)
  // @Validate(PasswordValidator, { message: '에러 메시지 오버라이드' })
  // @IsPasswordValid()
  // @IsPasswordValid({ message: '에러 메시지 오버라이드' })
  test: string;
}

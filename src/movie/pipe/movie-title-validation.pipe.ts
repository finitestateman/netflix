import { PipeTransform, ArgumentMetadata, Injectable, BadRequestException } from '@nestjs/common';

export interface MovieTitleValidationPipeOptions {
    exceptionFactory?: (error: string) => any;
    // true: MovieTitleRequiredException 발생(findAll에서 사용) -> true가 아니면 title이 무조건 존재해야 한다
    // false: Exception 발생하지 않음(findOne에서 @Query가 있다면 사용)
    allowNull?: boolean;
}

const MovieTitleLengthTooShortException = new BadRequestException('영화 제목은 3글자 이상이어야 합니다.');
const MovieTitleRequiredException = new BadRequestException('영화 제목은 필수 입력 항목입니다.');

const MovieTitleArrayNotAllowedException = new BadRequestException('배열은 허용되지 않습니다.');

@Injectable() // service처럼 provider로 관리된다`
export class MovieTitleValidationPipeGeneric<
    // NOTE: 여기서는 사실 제네릭으로 안 하는 게 맞지만 공부 목적이니 제네릭도 가능함을 보여주기 위해 제네릭을 사용한다(즉, 호출 시 사용자가 제네릭을 지정 가능하다)
    T = string | string[] | undefined, // 사용자가 여러 값을 보낼 수 있기 때문에 배열도 포함, @Body()를 받을 경우에는 아마 추가적인 타입에 대한 처리를 해야한다
    R = string,
> implements PipeTransform<T, R>
{
    private readonly defaultOptions: Required<MovieTitleValidationPipeOptions> = {
        exceptionFactory: (error: string) => error,
        allowNull: false, // 기본값 지정
    };

    public constructor(private readonly options?: MovieTitleValidationPipeOptions) {
        this.options = { ...this.defaultOptions, ...options };
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public transform(value: T, metadata: ArgumentMetadata): R {
        if (Array.isArray(value)) {
            throw MovieTitleArrayNotAllowedException;
        } else if (typeof value === 'string' && value?.length < 3) {
            throw MovieTitleLengthTooShortException;
        } else if (typeof value === 'undefined' && !this.options?.allowNull) {
            throw MovieTitleRequiredException;
        }
        return value as unknown as R;
    }
}

@Injectable()
export class MovieTitleValidationPipe implements PipeTransform<string, string> {
    private readonly defaultOptions: Required<MovieTitleValidationPipeOptions> = {
        exceptionFactory: (error: string) => error,
        allowNull: false,
    };

    public constructor(private readonly options?: MovieTitleValidationPipeOptions) {
        this.options = { ...this.defaultOptions, ...options };
    }

    public transform(value: string): string {
        // 강의에선 이렇게 했지만 단순히 그 아래에서 value?.length < 3 이렇게 해도 된다
        // if (value) return value;

        if (value?.length < 3) {
            throw MovieTitleLengthTooShortException;
        }
        return value;
    }
}

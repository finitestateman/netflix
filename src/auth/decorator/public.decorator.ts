import { Reflector } from '@nestjs/core';

export const Public = Reflector.createDecorator<void>({
    // 데코레이터 사용자가 아무 인자도 넣을 수 없고 그냥 무조건 true가 반환된다
    transform: () => true,
});

export const _Public2_ = Reflector.createDecorator<true>({
    // 데코레이터 사용자가 true만 넣을 수 있고 그거랑 관계 없이 무조건 true가 반환된다
    transform: () => true,
});

export const _Public3_ = Reflector.createDecorator<boolean>({
    // value는 데코레이터 사용 시의 인자이므로 생략 시 undefined다
    // undefined ?? true === true
    // true ?? true === true
    // false ?? true === false
    transform: (value) => value ?? true,
});

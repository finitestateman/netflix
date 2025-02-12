import { Reflector } from '@nestjs/core';
import { Role } from 'src/user/entities/user.entity';

export const RBAC = Reflector.createDecorator<Role>({
    //transform에서 타입 검증을 할 수 있기는 한데
    // 빌드타임에 잡진 못하고 런타임(중에서도 프로세스 시작 시 평가되면서) 에러 발생
    // 컴파일 타임이라고 하기엔 애매하고 런타임에 평가가 될 때 발생
    transform: (role: Role) => {
        if (role === undefined) {
            throw new Error('An argument is required for RBAC decorator');
        }
        return role;
    },
});

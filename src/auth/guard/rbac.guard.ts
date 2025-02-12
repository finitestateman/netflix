import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request as ExpressRequest } from 'express';
import { Payload } from '../auth.types';
import { Role } from 'src/user/entities/user.entity';
import { Reflector } from '@nestjs/core';
import { RBAC } from '../decorator/rbac.decorator';

@Injectable()
export class RBACGuard implements CanActivate {
    public constructor(private readonly reflector: Reflector) {}

    public canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        // 핸들러에 적용된 RBAC 데코레이터의 인자 값을 가져온다
        const role: Role = this.reflector.get<Role>(RBAC, context.getHandler());

        if (!Object.values(Role).includes(role)) {
            // 여기서 true를 반환하는 이유는 @RBAC() 데코레이터가 붙어있지 않은 경우에도 통과되도록 하기 위함
            return true;
        }

        // 공부용 코드이기 때문에 구조분해할당 안 쓰고 일부러 좀 풀어쓴다
        const request = context.switchToHttp().getRequest<ExpressRequest & { user: Payload }>();

        // 이 시점에서 Public이 아니었다면 accessTokenGuard에서 이미 user의 존재를 검증하긴 했다
        // 그래도 안전 차원에서 한번 더 검사
        // 밑에서 옵셔널 체이닝으로 처리했다
        // if (!request.user) {
        //     return false;
        // }

        // enum Role = { admin, paidUser, user }; 이기 때문에 숫자가 작을수록 높은 권한(좀 위험한 코드)
        return request.user?.role <= role;
    }

    // 내가 작성해본 코드
    public _canActivate_(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const rbac = this.reflector.get<Role>(RBAC, context.getHandler());

        const request = context.switchToHttp().getRequest<ExpressRequest & { user: Payload }>();
        const { role }: { role: Role } = request.user;

        if (rbac === Role.admin) {
            return true;
        }
        if (rbac === Role.paidUser) {
            return role === Role.paidUser || role === Role.admin;
        }
        if (rbac === Role.user) {
            return role === Role.user || role === Role.paidUser || role === Role.admin;
        }

        return true;
    }
}

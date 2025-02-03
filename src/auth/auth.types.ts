import type { Role } from 'src/user/entities/user.entity';

export type AuthTokens = {
    accessToken: string;
    refreshToken: string;
};

export type TokenType = 'access' | 'refresh';

export type JwtClaim = {
    sub: number;
    role: Role;
    tokenType?: TokenType;
};

// 그냥 인터섹션하면 sub가 옵셔널이 돼버린다
export type Payload = Omit<JwtClaim, 'sub'> & RegisteredClaim;

export type RegisteredClaim = {
    iss?: string; // issuer
    sub?: number; // subject
    aud?: string; // audience
    exp?: number; // expiration
    nbf?: number; // not before
    iat?: number; // issued at
    jti?: string; // jwt id
};

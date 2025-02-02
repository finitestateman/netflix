export type AuthTokens = {
    accessToken: string;
    refreshToken: string;
};

export type TokenType = 'access' | 'refresh';

export type RegisteredClaim = {
    iss?: string; // issuer
    sub?: number; // subject
    aud?: string; // audience
    exp?: number; // expiration
    nbf?: number; // not before
    iat?: number; // issued at
    jti?: string; // jwt id
};

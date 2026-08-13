declare module '@fastify/jwt' {
    interface FastifyJWT {
        namespaces: 'access' | 'refresh';
        payload: AccessTokenPayload | RefreshTokenPayload;
    }
}
export interface AccessTokenPayload {
    sub: number;
    isAdmin: boolean;
}
export interface RefreshTokenPayload {
    sub: number;
    jti: string;
}

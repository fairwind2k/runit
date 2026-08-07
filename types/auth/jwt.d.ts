import type { FastifyInstance } from 'fastify';
import type { AccessTokenPayload, RefreshTokenPayload } from './jwt.types';
export declare const ACCESS_TOKEN_TTL = "15m";
export declare const REFRESH_TOKEN_TTL = "30d";
export declare const REFRESH_TOKEN_TTL_MS: number;
export declare function signAccessToken(server: FastifyInstance, payload: AccessTokenPayload): string;
export declare function signRefreshToken(server: FastifyInstance, payload: RefreshTokenPayload): string;
export declare function verifyAccessToken(server: FastifyInstance, token: string): AccessTokenPayload;
export declare function verifyRefreshToken(server: FastifyInstance, token: string): RefreshTokenPayload;

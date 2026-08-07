import type { FastifyReply } from 'fastify';
export declare function setAuthCookies(reply: FastifyReply, accessToken: string, refreshToken: string): void;
export declare function clearAuthCookies(reply: FastifyReply): void;

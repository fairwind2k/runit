import type { FastifyInstance } from 'fastify';
import type { AccessTokenPayload, RefreshTokenPayload } from './jwt.types';

export const ACCESS_TOKEN_TTL = '15m';
export const REFRESH_TOKEN_TTL = '30d';
export const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export function signAccessToken(
  server: FastifyInstance,
  payload: AccessTokenPayload,
): string {
  return server.jwt.access.sign(payload, { expiresIn: ACCESS_TOKEN_TTL });
}

export function signRefreshToken(
  server: FastifyInstance,
  payload: RefreshTokenPayload,
): string {
  return server.jwt.refresh.sign(payload, { expiresIn: REFRESH_TOKEN_TTL });
}

export function verifyAccessToken(
  server: FastifyInstance,
  token: string,
): AccessTokenPayload {
  return server.jwt.access.verify<AccessTokenPayload>(token);
}

export function verifyRefreshToken(
  server: FastifyInstance,
  token: string,
): RefreshTokenPayload {
  return server.jwt.refresh.verify<RefreshTokenPayload>(token);
}

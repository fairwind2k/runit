import { randomUUID } from 'node:crypto';
import { TRPCError } from '@trpc/server';
import type { FastifyReply } from 'fastify';
import { z } from 'zod/v4';
import { clearAuthCookies, setAuthCookies } from '../auth/cookies';
import { emailSchema } from '../auth/email';
import {
  REFRESH_TOKEN_TTL_MS,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../auth/jwt';
import {
  hashPassword,
  validatePasswordPolicy,
  verifyPassword,
} from '../auth/password';
import { toPublicUser } from '../auth/publicUser';
import { protectedProcedure, publicProcedure, router } from '../context';
import {
  addPasswordHistoryEntry,
  findActiveRefreshToken,
  getUserByEmailWithCredentials,
  getUserByIdWithCredentials,
  revokeRefreshToken,
  storeRefreshToken,
} from '../db/auth';
import { createUser } from '../db/users';

const registerInputSchema = z.object({
  username: z.string().min(3).max(20),
  email: emailSchema,
  password: z.string(),
});

const loginInputSchema = z.object({
  email: emailSchema,
  password: z.string(),
});

async function issueSession(
  reply: FastifyReply,
  user: { id: number; isAdmin: boolean },
): Promise<string> {
  const accessToken = signAccessToken(reply.server, {
    sub: user.id,
    isAdmin: user.isAdmin,
  });

  const refreshToken = signRefreshToken(reply.server, {
    sub: user.id,
    jti: randomUUID(),
  });

  await storeRefreshToken(
    user.id,
    refreshToken,
    new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
  );

  setAuthCookies(reply, accessToken, refreshToken);

  // Double-submit CSRF-токен (см. security.ts) — фронт кладёт его в заголовок
  // csrf-token на всех mutation-запросах, кроме этого набора auth-эндпоинтов.
  return reply.generateCsrf();
}

export const authRouter = router({
  register: publicProcedure
    .input(registerInputSchema)
    .mutation(async ({ input, ctx }) => {
      const passwordCheck = validatePasswordPolicy(input.password);
      if (!passwordCheck.ok) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: passwordCheck.errors.join(', '),
        });
      }

      const existingByEmail = await getUserByEmailWithCredentials(input.email);
      if (existingByEmail) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Email already exists',
        });
      }

      const passwordHash = await hashPassword(input.password);

      const user = await createUser({
        username: input.username,
        email: input.email,
        password: passwordHash,
      });

      await addPasswordHistoryEntry(user.id, passwordHash);
      const csrfToken = await issueSession(ctx.res, user);

      return { user: toPublicUser(user), csrfToken };
    }),

  login: publicProcedure
    .input(loginInputSchema)
    .mutation(async ({ input, ctx }) => {
      const genericError = new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Wrong email or password',
      });

      const user = await getUserByEmailWithCredentials(input.email);
      if (!user) {
        throw genericError;
      }

      const passwordMatches = await verifyPassword(
        input.password,
        user.password,
      );
      if (!passwordMatches) {
        throw genericError;
      }

      const csrfToken = await issueSession(ctx.res, user);

      return { user: toPublicUser(user), csrfToken };
    }),

  logout: protectedProcedure.mutation(async ({ ctx }) => {
    const refreshToken = ctx.req.cookies?.refreshToken;
    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }

    clearAuthCookies(ctx.res);

    return { success: true };
  }),

  refresh: publicProcedure.mutation(async ({ ctx }) => {
    const refreshToken = ctx.req.cookies?.refreshToken;
    if (!refreshToken) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    let payload: ReturnType<typeof verifyRefreshToken>;
    try {
      payload = verifyRefreshToken(ctx.req.server, refreshToken);
    } catch {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    const activeRecord = await findActiveRefreshToken(refreshToken);
    if (!activeRecord) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    const user = await getUserByIdWithCredentials(payload.sub);
    if (!user) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    await revokeRefreshToken(refreshToken);
    const csrfToken = await issueSession(ctx.res, user);

    return { success: true, csrfToken };
  }),

  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await getUserByIdWithCredentials(ctx.user.id);
    if (!user) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    return { user: toPublicUser(user) };
  }),
});

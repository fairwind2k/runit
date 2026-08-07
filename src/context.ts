import { initTRPC, TRPCError } from '@trpc/server';
import type { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify';
import { verifyAccessToken } from './auth/jwt';

export interface AuthenticatedUser {
  id: number;
  isAdmin: boolean;
}

export interface Context {
  req: CreateFastifyContextOptions['req'];
  res: CreateFastifyContextOptions['res'];
  user: AuthenticatedUser | null;
}

export const createContext = ({
  req,
  res,
}: CreateFastifyContextOptions): Context => {
  const token = req.cookies?.accessToken;

  if (!token) {
    return { req, res, user: null };
  }

  try {
    const payload = verifyAccessToken(req.server, token);
    return { req, res, user: { id: payload.sub, isAdmin: payload.isAdmin } };
  } catch {
    return { req, res, user: null };
  }
};

const t = initTRPC.context<Context>().create({
  errorFormatter({ shape }) {
    return shape;
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

const isAuthenticated = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  return next({ ctx: { ...ctx, user: ctx.user } });
});

const isAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  if (!ctx.user.isAdmin) {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }

  return next({ ctx: { ...ctx, user: ctx.user } });
});

export const protectedProcedure = t.procedure.use(isAuthenticated);
export const adminProcedure = t.procedure.use(isAdmin);

import { createHash } from 'node:crypto';
import { and, desc, eq, gt, isNull } from 'drizzle-orm';
import { db } from './connection';
import {
  type NewPasswordHistoryEntry,
  type NewRefreshToken,
  passwordHistory,
  refreshTokens,
  type User,
  users,
} from './schema/schema';

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Возвращает полную запись пользователя, включая password-хеш — только для
 * внутренних auth-проверок (verifyPassword и т.п.). Никогда не отдавать
 * результат напрямую в tRPC-ответе.
 */
export async function getUserByEmailWithCredentials(
  email: string,
): Promise<User | undefined> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return user;
}

/**
 * См. getUserByEmailWithCredentials — та же оговорка про password-хеш.
 */
export async function getUserByIdWithCredentials(
  id: number,
): Promise<User | undefined> {
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);

  return user;
}

export async function storeRefreshToken(
  userId: number,
  token: string,
  expiresAt: Date,
): Promise<void> {
  const newRefreshToken: NewRefreshToken = {
    userId,
    tokenHash: hashToken(token),
    expiresAt,
  };

  await db.insert(refreshTokens).values(newRefreshToken);
}

export async function findActiveRefreshToken(token: string) {
  const tokenHash = hashToken(token);

  const [record] = await db
    .select()
    .from(refreshTokens)
    .where(
      and(
        eq(refreshTokens.tokenHash, tokenHash),
        isNull(refreshTokens.revokedAt),
        gt(refreshTokens.expiresAt, new Date()),
      ),
    )
    .limit(1);

  return record;
}

export async function revokeRefreshToken(token: string): Promise<void> {
  await db
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(eq(refreshTokens.tokenHash, hashToken(token)));
}

export async function getRecentPasswordHashes(
  userId: number,
  limit: number,
): Promise<string[]> {
  const rows = await db
    .select({ passwordHash: passwordHistory.passwordHash })
    .from(passwordHistory)
    .where(eq(passwordHistory.userId, userId))
    .orderBy(desc(passwordHistory.createdAt))
    .limit(limit);

  return rows.map((row) => row.passwordHash);
}

export async function addPasswordHistoryEntry(
  userId: number,
  passwordHashValue: string,
): Promise<void> {
  const entry: NewPasswordHistoryEntry = {
    userId,
    passwordHash: passwordHashValue,
  };

  await db.insert(passwordHistory).values(entry);
}

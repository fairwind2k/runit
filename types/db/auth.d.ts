import { type User } from './schema/schema';
export declare function hashToken(token: string): string;
/**
 * Возвращает полную запись пользователя, включая password-хеш — только для
 * внутренних auth-проверок (verifyPassword и т.п.). Никогда не отдавать
 * результат напрямую в tRPC-ответе.
 */
export declare function getUserByEmailWithCredentials(email: string): Promise<User | undefined>;
/**
 * См. getUserByEmailWithCredentials — та же оговорка про password-хеш.
 */
export declare function getUserByIdWithCredentials(id: number): Promise<User | undefined>;
export declare function storeRefreshToken(userId: number, token: string, expiresAt: Date): Promise<void>;
export declare function findActiveRefreshToken(token: string): Promise<{
    id: number;
    userId: number;
    tokenHash: string;
    expiresAt: Date;
    revokedAt: Date | null;
    createdAt: Date;
}>;
export declare function revokeRefreshToken(token: string): Promise<void>;
export declare function getRecentPasswordHashes(userId: number, limit: number): Promise<string[]>;
export declare function addPasswordHistoryEntry(userId: number, passwordHashValue: string): Promise<void>;

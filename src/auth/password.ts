import bcrypt from 'bcrypt';
import { commonPasswords } from './common-passwords';

const BCRYPT_COST_FACTOR = 12;
const MIN_PASSWORD_LENGTH = 8;
const MIN_CHARACTER_CATEGORIES = 3;
const PASSWORD_HISTORY_LIMIT = 5;

export interface PasswordValidationResult {
  ok: boolean;
  errors: string[];
}

export function validatePasswordPolicy(
  password: string,
): PasswordValidationResult {
  const errors: string[] = [];

  if (password.length < MIN_PASSWORD_LENGTH) {
    errors.push(
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`,
    );
  }

  const categories = [
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^a-zA-Z0-9]/.test(password),
  ].filter(Boolean).length;

  if (categories < MIN_CHARACTER_CATEGORIES) {
    errors.push(
      'Password must contain at least 3 of the following: lowercase letters, uppercase letters, digits, special characters',
    );
  }

  if (commonPasswords.has(password.toLowerCase())) {
    errors.push('Password is too common, please choose a different one');
  }

  return { ok: errors.length === 0, errors };
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_COST_FACTOR);
}

export async function verifyPassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function isPasswordReused(
  plain: string,
  previousHashes: string[],
): Promise<boolean> {
  const checks = await Promise.all(
    previousHashes
      .slice(0, PASSWORD_HISTORY_LIMIT)
      .map((hash) => verifyPassword(plain, hash)),
  );

  return checks.some(Boolean);
}

export { PASSWORD_HISTORY_LIMIT };

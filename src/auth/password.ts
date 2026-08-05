import bcrypt from 'bcrypt';
import { z } from 'zod/v4';
import { commonPasswords } from './common-passwords';

const BCRYPT_COST_FACTOR = 12;
const MIN_PASSWORD_LENGTH = 8;
const MIN_CHARACTER_CATEGORIES = 3;
export const PASSWORD_HISTORY_LIMIT = 5;

function countCharacterCategories(password: string): number {
  return [
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^a-zA-Z0-9]/.test(password),
  ].filter(Boolean).length;
}

export const buildPasswordPolicySchema = (
  minLength: number = MIN_PASSWORD_LENGTH,
) =>
  z
    .string()
    .min(minLength, `Password must be at least ${minLength} characters long`)
    .superRefine((password, ctx) => {
      if (countCharacterCategories(password) < MIN_CHARACTER_CATEGORIES) {
        ctx.addIssue({
          code: 'custom',
          message:
            'Password must contain at least 3 of the following: lowercase letters, uppercase letters, digits, special characters',
        });
      }

      if (commonPasswords.has(password.toLowerCase())) {
        ctx.addIssue({
          code: 'custom',
          message: 'Password is too common, please choose a different one',
        });
      }
    });

export const passwordPolicySchema = buildPasswordPolicySchema();

export interface PasswordValidationResult {
  ok: boolean;
  errors: string[];
}

export function validatePasswordPolicy(
  password: string,
  minLength: number = MIN_PASSWORD_LENGTH,
): PasswordValidationResult {
  const schema =
    minLength === MIN_PASSWORD_LENGTH
      ? passwordPolicySchema
      : buildPasswordPolicySchema(minLength);
  const result = schema.safeParse(password);

  if (result.success) {
    return { ok: true, errors: [] };
  }

  return {
    ok: false,
    errors: result.error.issues.map((issue) => issue.message),
  };
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

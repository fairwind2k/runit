import { z } from 'zod/v4';
export declare const PASSWORD_HISTORY_LIMIT = 5;
export declare const buildPasswordPolicySchema: (minLength?: number) => z.ZodString;
export declare const passwordPolicySchema: z.ZodString;
export interface PasswordValidationResult {
    ok: boolean;
    errors: string[];
}
export declare function validatePasswordPolicy(password: string, minLength?: number): PasswordValidationResult;
export declare function hashPassword(plain: string): Promise<string>;
export declare function verifyPassword(plain: string, hash: string): Promise<boolean>;
export declare function isPasswordReused(plain: string, previousHashes: string[]): Promise<boolean>;

import { z } from 'zod/v4';

const MAX_EMAIL_LENGTH = 254;
const MAX_LOCAL_PART_LENGTH = 64;
const MAX_DOMAIN_LENGTH = 190;

// Simplified RFC 5322 pattern, as specified in the requirements.
const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export const emailSchema = z
  .string()
  .transform(normalizeEmail)
  .pipe(
    z
      .string()
      .max(MAX_EMAIL_LENGTH)
      .regex(EMAIL_PATTERN, 'Invalid email format')
      .refine(
        (email) => email.split('@')[0].length <= MAX_LOCAL_PART_LENGTH,
        `Email local part must be at most ${MAX_LOCAL_PART_LENGTH} characters long`,
      )
      .refine(
        (email) => email.split('@')[1].length <= MAX_DOMAIN_LENGTH,
        `Email domain must be at most ${MAX_DOMAIN_LENGTH} characters long`,
      ),
  );

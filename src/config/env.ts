import { z } from 'zod/v4';

const isProduction = process.env.NODE_ENV === 'production';

const secret = (name: string) =>
  z
    .string()
    .min(32, `${name} must be at least 32 characters long`)
    .refine((value) => !isProduction || value !== 'dev-insecure-secret', {
      message: `${name} must not use the development default in production`,
    });

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  HOST: z.string().default('0.0.0.0'),
  PORT: z.coerce.number().int().positive().default(3001),
  DB_PATH: z.string().default('database.sqlite'),
  JWT_ACCESS_SECRET: secret('JWT_ACCESS_SECRET'),
  JWT_REFRESH_SECRET: secret('JWT_REFRESH_SECRET'),
});

export type Env = z.infer<typeof envSchema>;

const devFallbackSecrets = {
  JWT_ACCESS_SECRET: 'dev-insecure-secret-do-not-use-in-production!!',
  JWT_REFRESH_SECRET: 'dev-insecure-secret-do-not-use-in-production!!',
};

const loadEnv = (): Env => {
  const raw = { ...process.env };

  if (raw.NODE_ENV !== 'production') {
    raw.JWT_ACCESS_SECRET ||= devFallbackSecrets.JWT_ACCESS_SECRET;
    raw.JWT_REFRESH_SECRET ||= devFallbackSecrets.JWT_REFRESH_SECRET;
  }

  const result = envSchema.safeParse(raw);

  if (!result.success) {
    console.error('❌ Invalid environment configuration:');
    for (const issue of result.error.issues) {
      console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
    }
    throw new Error('Environment validation failed');
  }

  if (raw.NODE_ENV !== 'production') {
    if (
      result.data.JWT_ACCESS_SECRET === devFallbackSecrets.JWT_ACCESS_SECRET ||
      result.data.JWT_REFRESH_SECRET === devFallbackSecrets.JWT_REFRESH_SECRET
    ) {
      console.warn(
        '⚠️  Using insecure default JWT secrets for local development. Set JWT_ACCESS_SECRET / JWT_REFRESH_SECRET in .env for anything beyond local dev.',
      );
    }
  }

  return result.data;
};

export const env = loadEnv();

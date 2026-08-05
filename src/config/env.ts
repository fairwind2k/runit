import { z } from 'zod/v4';
import { buildPasswordPolicySchema } from '../auth/password';

const MIN_SECRET_LENGTH = 32;

const secret = () => buildPasswordPolicySchema(MIN_SECRET_LENGTH);

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  HOST: z.string().default('0.0.0.0'),
  PORT: z.coerce.number().int().positive().default(3001),
  DB_PATH: z.string().default('database.sqlite'),
  JWT_ACCESS_SECRET: secret(),
  JWT_REFRESH_SECRET: secret(),
});

export type Env = z.infer<typeof envSchema>;

export const env = envSchema.parse(process.env);

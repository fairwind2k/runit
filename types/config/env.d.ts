import { z } from 'zod/v4';
declare const envSchema: z.ZodObject<{
    NODE_ENV: z.ZodDefault<z.ZodEnum<{
        development: "development";
        test: "test";
        production: "production";
    }>>;
    HOST: z.ZodDefault<z.ZodString>;
    PORT: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    DB_PATH: z.ZodDefault<z.ZodString>;
    JWT_ACCESS_SECRET: z.ZodString;
    JWT_REFRESH_SECRET: z.ZodString;
    CORS_ORIGIN: z.ZodDefault<z.ZodString>;
}, z.core.$strip>;
export type Env = z.infer<typeof envSchema>;
export declare const env: {
    NODE_ENV: "development" | "test" | "production";
    HOST: string;
    PORT: number;
    DB_PATH: string;
    JWT_ACCESS_SECRET: string;
    JWT_REFRESH_SECRET: string;
    CORS_ORIGIN: string;
};
export {};

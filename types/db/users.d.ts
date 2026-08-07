import { z } from 'zod/v4';
import { snippets, type UserSettings } from './schema/schema';
export type SafeUser = {
    id: number;
    username: string;
    email: string;
    isAdmin: boolean;
    createdAt: Date;
    updatedAt: Date;
};
export declare const userSchema: z.ZodObject<{
    id: z.ZodNumber;
    username: z.ZodString;
    email: z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>, z.ZodString>;
    password: z.ZodString;
    isAdmin: z.ZodDefault<z.ZodBoolean>;
    recoverHash: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, z.core.$strip>;
export declare const createUserSchema: z.ZodObject<{
    username: z.ZodString;
    email: z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>, z.ZodString>;
    password: z.ZodString;
    isAdmin: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    recoverHash: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updateUserSchema: z.ZodObject<{
    id: z.ZodNumber;
    username: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>, z.ZodString>>;
    password: z.ZodOptional<z.ZodString>;
    recoverHash: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const userSettingsSchema: z.ZodObject<{
    id: z.ZodNumber;
    userId: z.ZodNumber;
    theme: z.ZodDefault<z.ZodEnum<{
        system: "system";
        light: "light";
        dark: "dark";
    }>>;
    language: z.ZodDefault<z.ZodEnum<{
        ru: "ru";
        en: "en";
        es: "es";
        fr: "fr";
        de: "de";
    }>>;
    avatarBase64: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, z.core.$strip>;
export declare const createUserSettingsSchema: z.ZodObject<{
    userId: z.ZodNumber;
    theme: z.ZodOptional<z.ZodDefault<z.ZodEnum<{
        system: "system";
        light: "light";
        dark: "dark";
    }>>>;
    language: z.ZodOptional<z.ZodDefault<z.ZodEnum<{
        ru: "ru";
        en: "en";
        es: "es";
        fr: "fr";
        de: "de";
    }>>>;
    avatarBase64: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export declare const updateUserSettingsSchema: z.ZodObject<{
    userId: z.ZodNumber;
    theme: z.ZodOptional<z.ZodEnum<{
        system: "system";
        light: "light";
        dark: "dark";
    }>>;
    language: z.ZodOptional<z.ZodEnum<{
        ru: "ru";
        en: "en";
        es: "es";
        fr: "fr";
        de: "de";
    }>>;
    avatarBase64: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export declare const deleteUserSchema: z.ZodObject<{
    id: z.ZodCoercedNumber<unknown>;
}, z.core.$strip>;
export declare const setUserRoleSchema: z.ZodObject<{
    id: z.ZodNumber;
    isAdmin: z.ZodBoolean;
}, z.core.$strip>;
export declare const getUserByIdSchema: z.ZodNumber;
export declare const getUserByEmailSchema: z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>, z.ZodString>;
export declare const getUserByUsernameSchema: z.ZodString;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateUserSettingsInput = z.infer<typeof updateUserSettingsSchema>;
export declare function getUserById(id: number): Promise<SafeUser | undefined>;
export declare function getUserByEmail(email: string): Promise<SafeUser | undefined>;
export declare function getUserByUsername(username: string): Promise<SafeUser | undefined>;
export declare function getAllUsers(): Promise<SafeUser[]>;
export declare function createUser(userData: CreateUserInput): Promise<SafeUser>;
export declare function updateUser(id: number, updates: Omit<UpdateUserInput, 'id'>): Promise<SafeUser | null>;
export declare function setUserRole(id: number, isAdmin: boolean): Promise<SafeUser | null>;
export declare function deleteUser(id: number): Promise<boolean>;
export declare function updateRecoverHash(email: string, recoverHash: string | null): Promise<boolean>;
export declare function getUserSettings(userId: number): Promise<UserSettings>;
export declare function updateUserSettings(id: number, updateData: Omit<UpdateUserSettingsInput, 'userId'>): Promise<UserSettings>;
export declare function getData({ id }: {
    id: number;
}): Promise<{
    currentUser: SafeUser & {
        language: string;
        theme: string;
        avatarBase64: string | null;
    };
    snippets: (typeof snippets.$inferSelect & {
        user: SafeUser;
    })[];
}>;

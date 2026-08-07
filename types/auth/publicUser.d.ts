export interface PublicUser {
    id: number;
    username: string;
    email: string;
    isAdmin: boolean;
    createdAt: Date;
    updatedAt: Date;
}
/** Проецирует запись пользователя на безопасные поля — никогда не включает password/recoverHash. */
export declare function toPublicUser(user: PublicUser): PublicUser;

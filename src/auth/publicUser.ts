export interface PublicUser {
  id: number;
  username: string;
  email: string;
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Проецирует запись пользователя на безопасные поля — никогда не включает password/recoverHash. */
export function toPublicUser(user: PublicUser): PublicUser {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    isAdmin: user.isAdmin,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

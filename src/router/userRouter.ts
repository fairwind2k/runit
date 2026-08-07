import { TRPCError } from '@trpc/server';
import { hashPassword, validatePasswordPolicy } from '../auth/password';
import { adminProcedure, publicProcedure, router } from '../context';

import {
  createUser,
  createUserSchema,
  deleteUser,
  deleteUserSchema,
  getAllUsers,
  getData,
  getUserByEmail,
  getUserByEmailSchema,
  getUserById,
  getUserByIdSchema,
  getUserByUsername,
  getUserByUsernameSchema,
  getUserSettings,
  setUserRole,
  setUserRoleSchema,
  updateUser,
  updateUserSchema,
  updateUserSettings,
  updateUserSettingsSchema,
} from '../db/users';

export const userRouter = router({
  getUserById: publicProcedure
    .input(getUserByIdSchema)
    .query(async ({ input }) => {
      const user = await getUserById(input);
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    }),

  getUserByEmail: publicProcedure
    .input(getUserByEmailSchema)
    .query(async ({ input }) => {
      const user = await getUserByEmail(input);
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    }),

  getUserByUsername: publicProcedure
    .input(getUserByUsernameSchema)
    .query(async ({ input }) => {
      const user = await getUserByUsername(input);
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    }),

  // Легаси-маршрут, отдающий всех пользователей (включая password-хеши) —
  // ограничен админами до переезда на profile-агрегаты (#717/#718).
  getAllUsers: adminProcedure.query(async () => {
    return await getAllUsers();
  }),

  // Ограничен админами: создаёт пользователя вне обычного флоу регистрации
  // (auth.register). Хеширует пароль и проверяет политику самостоятельно,
  // т.к. createUser() в db/users.ts ожидает уже готовый хеш.
  createUser: adminProcedure
    .input(createUserSchema)
    .mutation(async ({ input }) => {
      const passwordCheck = validatePasswordPolicy(input.password);
      if (!passwordCheck.ok) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: passwordCheck.errors.join(', '),
        });
      }

      const passwordHash = await hashPassword(input.password);

      return await createUser({ ...input, password: passwordHash });
    }),

  updateUser: publicProcedure
    .input(updateUserSchema)
    .mutation(async ({ input }) => {
      const { id, ...updates } = input;
      return await updateUser(id, updates);
    }),

  // isAdmin исключён из updateUserSchema намеренно — смена роли идёт только
  // через этот отдельный admin-only маршрут.
  setUserRole: adminProcedure
    .input(setUserRoleSchema)
    .mutation(async ({ input, ctx }) => {
      if (input.id === ctx.user.id && !input.isAdmin) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot remove your own admin role',
        });
      }

      const user = await setUserRole(input.id, input.isAdmin);
      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
      }

      return user;
    }),

  deleteUser: publicProcedure
    .input(deleteUserSchema)
    .mutation(async ({ input }) => {
      const success = await deleteUser(input.id);

      if (!success) {
        throw new Error('User not found');
      }

      return { success: true, id: input };
    }),

  // получить настройки пользователя - profile?
  getUserSettings: publicProcedure
    .input(getUserByIdSchema)
    .query(async ({ input }) => {
      return await getUserSettings(input);
    }),

  updateUserSettings: publicProcedure
    .input(updateUserSettingsSchema)
    .mutation(async ({ input }) => {
      const { userId, ...settings } = input;
      return await updateUserSettings(userId, settings);
    }),

  // или это - profile? настройки И сниппеты
  getData: publicProcedure.input(getUserByIdSchema).query(async ({ input }) => {
    return await getData({ id: input });
  }),
});

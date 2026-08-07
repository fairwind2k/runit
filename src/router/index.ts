import { router } from '../context';
import { authRouter } from './authRouter';
import { homePageRouter } from './homePageRouter';
import { runnerRouter } from './runnerRouter';
import { snippetRouter } from './snippetRouter';
import { userRouter } from './userRouter';

export const appRouter = router({
  auth: authRouter, // Роутер аутентификации
  users: userRouter, // Роутер для пользователей
  snippets: snippetRouter, // Роутер для сниппетов
  homePage: homePageRouter, // Роутер для главной страницы
  runner: runnerRouter, // Роутер запуска кода
});

export type AppRouter = typeof appRouter;

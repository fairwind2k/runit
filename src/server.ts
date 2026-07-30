import 'dotenv/config';
import type { FastifyInstance } from 'fastify';
import { env } from './config/env';
import getApp from './index';

const app: FastifyInstance = await getApp();

app.listen(
  { port: env.PORT, host: env.HOST },
  (err: Error | null, _address: string) => {
    if (err) {
      console.error('Error starting server:', err);
      process.exit(1);
    }
  },
);

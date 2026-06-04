import { Queue } from 'bullmq';
import { env } from '../../config.js';

const connection = {
  host: env.REDIS_HOST || '127.0.0.1',
  port: Number(env.REDIS_PORT) || 6379,
  password: env.REDIS_PASSWORD || undefined,
  tls: env.REDIS_TLS === 'true' ? {} : undefined,
};

export const mailQueue = new Queue('mail-queue', { connection });

export const addMailJob = async (data) => {
  await mailQueue.add('send-welcome-email', data, {
    attempts: 3, // Retry 3 times if the mail server is down
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  });
};
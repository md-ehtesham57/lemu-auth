import { Queue } from 'bullmq';
import { env } from '../../config.js';

// Connection to our Redis engine
const connection = {
  host: env.REDIS_HOST || '127.0.0.1',
  port: env.REDIS_PORT || 6379
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
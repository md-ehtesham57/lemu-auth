import { Worker } from 'bullmq';
import { MailService } from '../../infrastructure/services/MailService.js';
import { env } from '../../config.js';

const mailService = new MailService();

// This worker connects to Redis/Valkey and waits for jobs
const worker = new Worker('mail-queue', async (job) => {
  const { type, email, name, token } = job.data;
  
  console.log(`Worker: Processing ${type} email for ${email}...`);
  
  try {
    switch (type) {
      case "verification":
        await mailService.sendVerificationEmail(email, name, token);
        break;
      case "password-reset":
        await mailService.sendPasswordReset(email, token);
        break;
      default:
        console.warn(`Worker: Unknown job type: ${type}`);
    }
    console.log(`Worker: ${type} email sent to ${email} successfully!`);
  } catch (error) {
    console.error(`Worker: Failed to send ${type} email to ${email}. Job will retry.`);
    throw error; // Throwing tells BullMQ to retry the job later
  }
}, {
  connection: { 
    host: env.REDIS_HOST || '127.0.0.1', 
    port: Number(env.REDIS_PORT) || 6379,
    password: env.REDIS_PASSWORD || undefined,
    tls: env.REDIS_TLS === 'true' ? {} : undefined,
  }
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed after all retries: ${err.message}`);
});

console.log("Mail Worker is online and listening for jobs...");

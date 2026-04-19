import { Worker } from 'bullmq';
import { MailService } from '../services/MailService.js';
import { env } from '../../config.js';

const mailService = new MailService();

// This worker connects to Redis/Valkey and waits for jobs
const worker = new Worker('mail-queue', async (job) => {
  const { email, name, token } = job.data;
  
  console.log(`Worker: Processing email for ${email}...`);
  
  try {
    await mailService.sendVerificationEmail(email, name, token);
    console.log(`Worker: Email sent to ${email} successfully!`);
  } catch (error) {
    console.error(`Worker: Failed to send email to ${email}. Job will retry.`);
    throw error; // Throwing tells BullMQ to retry the job later
  }
}, {
  connection: { 
    host: env.REDIS_HOST || '127.0.0.1', 
    port: env.REDIS_PORT || 6379 
  }
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed after all retries: ${err.message}`);
});

console.log("Mail Worker is online and listening for jobs...");
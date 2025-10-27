import Queue from 'bull';
import { sendPasswordResetEmail } from '../services/email.service.js';
import logger from '../config/logger.js';
import env from '../config/env.js';

export const emailQueue = new Queue('emails', {
  redis: {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
  },
});

emailQueue.process(async (job) => {
  const { type, data } = job.data;
  
  logger.info(`Processing email job: ${type}`, { jobId: job.id });
  
  try {
    switch (type) {
      case 'password-reset':
        await sendPasswordResetEmail(data.email, data.code, data.resetLink);
        break;
      
      case 'welcome':
        logger.info(`Welcome email sent to ${data.email}`);
        break;
      
      case 'appointment-reminder':
        logger.info(`Appointment reminder sent to ${data.email}`);
        break;
      
      default:
        logger.warn(`Unknown email type: ${type}`);
    }
    
    logger.info(`Email job completed: ${type}`, { jobId: job.id });
  } catch (error) {
    logger.error(`Email job failed: ${type}`, { jobId: job.id, error: error.message });
    throw error;
  }
});

emailQueue.on('completed', (job) => {
  logger.info(`Email job ${job.id} completed`);
});

emailQueue.on('failed', (job, err) => {
  logger.error(`Email job ${job.id} failed:`, err.message);
});

export async function addEmailToQueue(type, data, options = {}) {
  try {
    const job = await emailQueue.add(
      { type, data },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        ...options,
      }
    );
    logger.info(`Email job added to queue: ${type}`, { jobId: job.id });
    return job;
  } catch (error) {
    logger.error(`Failed to add email to queue: ${error.message}`);
    throw error;
  }
}

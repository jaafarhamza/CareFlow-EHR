import Redis from 'ioredis';
import env from './env.js';
import logger from './logger.js';

// amazonq-ignore-next-line
// amazonq-ignore-next-line
// amazonq-ignore-next-line
// amazonq-ignore-next-line
// amazonq-ignore-next-line
const redis = new Redis({
  host: env.REDIS_HOST || 'redis',
  port: env.REDIS_PORT || 6379,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on('connect', () => {
  logger.info('Redis connected successfully');
});

redis.on('error', (err) => {
  logger.error('Redis connection error:', err);
});

export default redis;

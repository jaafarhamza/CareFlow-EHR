import redis from '../config/redis.js';
import logger from '../config/logger.js';

const DEFAULT_TTL = 3600; // 1 hour

export async function set(key, value, ttl = DEFAULT_TTL) {
  try {
    await redis.setex(key, ttl, JSON.stringify(value));
    logger.debug(`Cache set: ${key} (TTL: ${ttl}s)`);
  } catch (error) {
    logger.error(`Cache set error: ${error.message}`);
  }
}

export async function get(key) {
  try {
    const data = await redis.get(key);
    if (data) {
      logger.debug(`Cache hit: ${key}`);
      try {
        return JSON.parse(data);
      } catch (parseError) {
        logger.error(`Cache parse error for key ${key}: ${parseError.message}`);
        await redis.del(key);
        return null;
      }
    }
    logger.debug(`Cache miss: ${key}`);
    return null;
  } catch (error) {
    logger.error(`Cache get error: ${error.message}`);
    return null;
  }
}

export async function del(key) {
  try {
    await redis.del(key);
    logger.debug(`Cache deleted: ${key}`);
  } catch (error) {
    logger.error(`Cache delete error: ${error.message}`);
  }
}

export async function delPattern(pattern) {
  try {
    const stream = redis.scanStream({ match: pattern, count: 100 });
    const pipeline = redis.pipeline();
    let count = 0;
    
    for await (const keys of stream) {
      if (keys.length) {
        keys.forEach(key => pipeline.del(key));
        count += keys.length;
      }
    }
    
    if (count > 0) {
      await pipeline.exec();
      logger.debug(`Cache deleted pattern: ${pattern} (${count} keys)`);
    }
  } catch (error) {
    logger.error(`Cache delete pattern error: ${error.message}`);
  }
}

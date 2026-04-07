import { Redis } from '@upstash/redis';

const redisUrl = process.env.UPSTASH_REDIS_REST_URL || 'https://dummy-url.upstash.io';
const validUrl = redisUrl.startsWith('http') ? redisUrl : 'https://dummy-url.upstash.io';

const redis = new Redis({
  url: validUrl,
  token: process.env.UPSTASH_REDIS_REST_TOKEN || 'dummy_token',
});

/**
 * Lock a slot for 5 minutes during payment
 * Key format: slot:{doctorId}:{date}:{startTime}
 */
export async function lockSlot(
  doctorId: string,
  date: string,
  startTime: string
): Promise<boolean> {
  const key = `slot:${doctorId}:${date}:${startTime}`;
  const result = await redis.set(key, 'locked', { nx: true, ex: 300 }); // 5 min TTL
  return result === 'OK';
}

/**
 * Check if a slot is locked
 */
export async function isSlotLocked(
  doctorId: string,
  date: string,
  startTime: string
): Promise<boolean> {
  const key = `slot:${doctorId}:${date}:${startTime}`;
  const result = await redis.get(key);
  return result !== null;
}

/**
 * Release a slot lock
 */
export async function releaseSlot(
  doctorId: string,
  date: string,
  startTime: string
): Promise<void> {
  const key = `slot:${doctorId}:${date}:${startTime}`;
  await redis.del(key);
}

export default redis;

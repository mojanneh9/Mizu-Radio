// pages/api/test-redis.js
import { redis } from '../../lib/redis';

export default async function handler(req, res) {
  await redis.set('test_key', 'hello');
  const value = await redis.get('test_key');
  res.status(200).json({ value });
}
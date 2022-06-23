import IORedis from 'ioredis';

export const redis = new IORedis(
	process.env.REDIS ?? 'redis://:@localhost:6379',
);

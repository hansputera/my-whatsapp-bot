import * as IORedis from 'ioredis';

export const redis = new IORedis(process.env.REDIS);

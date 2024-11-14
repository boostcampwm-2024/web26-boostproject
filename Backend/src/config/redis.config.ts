// src/config/redis.config.ts
import { RedisModuleOptions } from '@nestjs-modules/ioredis';
import { ConfigService } from '@nestjs/config';

export const redisConfig = (configService: ConfigService): RedisModuleOptions => ({
  type: 'single',
  url: configService.get<string>('REDIS_URL'),
  options: {
    password: configService.get<string>('REDIS_PASSWORD'),
    retryStrategy: times => configService.get<number>('REDIS_RETRY_MILLISECONDS'),
  },
});

import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import { UUID } from 'crypto';
import Redis from 'ioredis';

@Injectable()
export class ChatsService {
  constructor(@InjectRedis() private redisClient: Redis) {}

  async readViewers(channelId: UUID) {
    return await this.redisClient.get(`/chats/${channelId}:viewers`);
  }

  async clearChat(channelId: UUID) {
    this.redisClient.del(`/chats/${channelId}:viewers`);
    this.redisClient.del(`/chats/${channelId}:chats`);
  }
}

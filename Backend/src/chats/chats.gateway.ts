import { InjectRedis } from '@nestjs-modules/ioredis';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import Redis from 'ioredis';
import { Server, Socket } from 'socket.io';
import { UsersService } from 'src/users/users.service';
import * as crypto from 'crypto';
import { UUID } from 'crypto';
import { UserEntity } from 'src/users/entity/user.entity';

@WebSocketGateway({ namespace: '/chats' })
export class ChatsGateway implements OnGatewayDisconnect, OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  private readonly OLD_CHATS_RESIZE_TRIGGER = 100;
  private readonly OLD_CHATS_MAXIMUM_SIZE = 50;

  constructor(
    @InjectRedis() private redisClient: Redis,
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  @SubscribeMessage('join')
  async joinChatRoom(@ConnectedSocket() socket: Socket, @MessageBody('channelId') channelId: UUID) {
    socket.join(channelId);
    socket.data.channelId = channelId;
    const redisKey = `${channelId}:chats`;

    this.redisClient.hincrby(`${channelId}:viewers`, socket.data.user.id, 1);

    const oldChats = await this.redisClient.lrange(redisKey, -this.OLD_CHATS_MAXIMUM_SIZE, -1);
    socket.emit('chat', oldChats);

    this.resizeOldChats(redisKey);
  }

  @SubscribeMessage('chat')
  async publishChat(@ConnectedSocket() socket: Socket, @MessageBody() receivedChat: { message }) {
    const { user, channelId } = socket.data;

    if (user instanceof UserEntity) {
      const newChat = JSON.stringify({
        content: receivedChat,
        nickname: user.nickname,
        userId: user.id,
        timestamp: new Date(),
      });

      const redisKey = `${channelId}:chats`;

      this.server.to(channelId).emit('chat', [newChat]);
      this.redisClient.rpush(redisKey, newChat);
    }
  }

  async handleConnection(socket: Socket) {
    try {
      const token = socket.handshake.auth?.token;

      if (token) {
        // 토큰이 있는 경우
        const payload = this.jwtService.verify(token);
        const { id } = payload.sub;
        const user = await this.usersService.findById(id);

        if (user) {
          socket.data.user = user;
        }
      }

      if (!socket.data.user) {
        socket.data.user = { id: crypto.createHash('sha256').update(socket.handshake.address).digest('hex') };
      }
    } catch (error) {
      // 토큰 검증 실패 등의 경우
      socket.data.user = { id: crypto.createHash('sha256').update(socket.handshake.address).digest('hex') };
    }

    socket.emit('auth', { message: 'authorization completed' });
  }

  async handleDisconnect(socket: Socket) {
    const { user, channelId } = socket.data;
    const redisKey = `${channelId}:viewers`;

    await this.redisClient.hincrby(redisKey, user.id, -1);
    const count = await this.redisClient.hget(redisKey, user.id);

    if (parseInt(count) <= 0) {
      this.redisClient.hdel(redisKey, user.id);
    }
  }

  async resizeOldChats(redisKey: string) {
    const currentSize = await this.redisClient.llen(redisKey);
    if (currentSize >= this.OLD_CHATS_RESIZE_TRIGGER) {
      this.redisClient.ltrim(redisKey, -this.OLD_CHATS_MAXIMUM_SIZE, -1);
    }
  }
}

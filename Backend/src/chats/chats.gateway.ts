import { InjectRedis } from '@nestjs-modules/ioredis';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import Redis from 'ioredis';
import { Server, Socket } from 'socket.io';

const NAMESPACE_REGEX = /^\/chats\/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@WebSocketGateway({ namespace: NAMESPACE_REGEX })
export class ChatsGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(@InjectRedis() private redisClient: Redis) {}

  @SubscribeMessage('chat')
  async publishChat(@ConnectedSocket() client: Socket, @MessageBody() receivedChat: string) {
    const namespace = client.nsp;
    // TODO 로그인 검증(JWT)
    const parsedChat = JSON.parse(receivedChat);

    const newChat = JSON.stringify({ message: parsedChat?.message }); // TODO 유저 정보 추가 필요
    const redisKey = `${namespace.name}:chats`;

    namespace.emit('chat', newChat); // 해당 네임스페이스의 모든 클라이언트에게 메시지 전송
    this.redisClient.rpush(redisKey, newChat);
    this.redisClient.ltrim(redisKey, -50, -1); // TODO .env로 주입받기
  }

  async handleConnection(@ConnectedSocket() client: Socket) {
    const oldChats = await this.redisClient.lrange(`${client.nsp.name}:chats`, 0, -1);

    client.emit('chat', JSON.stringify({ oldChats, type: 'old' }));
  }
}

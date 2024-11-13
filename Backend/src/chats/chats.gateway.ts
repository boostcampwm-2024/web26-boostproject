import { Inject } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import Redis from 'ioredis';
import { Server, Socket } from 'socket.io';

const NAMESPACE_REGEX = /^\/chats\/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@WebSocketGateway({ namespace: NAMESPACE_REGEX })
export class ChatsGateway {
  @WebSocketServer()
  server: Server;

  constructor(@Inject('Redis') private redisClient: Redis) {}

  @SubscribeMessage('chat')
  publishChat(@ConnectedSocket() client: Socket, @MessageBody() receivedChat: string): void {
    const namespace = client.nsp;
    // TODO 로그인 검증(JWT)
    const parsedChat = JSON.parse(receivedChat);
    const chatToPublish = JSON.stringify({ message: parsedChat?.message }); // TODO 유저 정보 추가 필요

    this.redisClient.rpush(namespace.name, chatToPublish);
    namespace.emit('chat', chatToPublish); // 해당 네임스페이스의 모든 클라이언트에게 메시지 전송
  }
}

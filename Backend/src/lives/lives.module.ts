import { Module } from '@nestjs/common';
import { LivesService } from './lives.service';
import { LivesController } from './lives.controller';
import { LiveEntity } from './entity/live.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatsModule } from 'src/chats/chats.module';

@Module({
  imports: [TypeOrmModule.forFeature([LiveEntity]), ChatsModule],
  providers: [LivesService],
  controllers: [LivesController],
  exports: [LivesService],
})
export class LivesModule {}

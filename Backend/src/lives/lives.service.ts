import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { LiveEntity } from './entity/live.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { LivesDto } from './dto/lives.dto';
import { LiveDto } from './dto/live.dto';
import { UUID } from 'crypto';
import { ErrorMessage } from './error/error.message.enum';
import { ChatsService } from './../chats/chats.service';

@Injectable()
export class LivesService {
  constructor(
    @InjectRepository(LiveEntity) private livesRepository: Repository<LiveEntity>,
    private chatsService: ChatsService,
  ) {}

  async readLives(where: FindOptionsWhere<LiveEntity> = {}): Promise<LivesDto[]> {
    // TODO 데이터 베이스 뷰 추가
    const lives = await this.livesRepository.find({
      relations: ['category', 'user'],
      where,
    });
    return lives.map(entity => entity.toLivesDto());
  }

  async readLive(channelId: string): Promise<LiveDto> {
    const live = await this.livesRepository.findOne({ relations: ['category', 'user'], where: { channelId } });

    if (!live) {
      throw new NotFoundException(ErrorMessage.LIVE_NOT_FOUND);
    }

    return live.toLiveDto();
  }

  async updateLive({ channelId, updateLiveDto }) {
    // TODO 요청자와 채널 소유자 일치여부 체크(로그인 기능 구현 후)
    await this.livesRepository.update({ channelId }, updateLiveDto);
  }

  async readChannelId(streamingKey: UUID) {
    const live = await this.livesRepository.findOne({ where: { streamingKey } });
    return { channelId: live.channelId };
  }

  async startLive(streamingKey: UUID) {
    const live = await this.livesRepository.findOne({ where: { streamingKey } });

    if (live.onAir) {
      throw new ConflictException(ErrorMessage.LIVE_ALREADY_STARTED);
    }

    this.chatsService.clearChat(live.channelId as UUID);
    await this.livesRepository.update({ streamingKey }, { startedAt: new Date(), onAir: true });
  }

  async endLive(channelId: UUID) {
    this.livesRepository.update({ channelId }, { onAir: false });
    this.chatsService.clearChat(channelId);
  }
}

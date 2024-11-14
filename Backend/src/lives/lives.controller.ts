import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { LivesService } from './lives.service';
import { LivesDto } from './dto/lives.dto';
import { LiveDto } from './dto/live.dto';
import { UpdateLiveDto } from './dto/update.live.dto';
import { UUID } from 'crypto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UserEntity } from 'src/users/entity/user.entity';

@Controller('lives')
export class LivesController {
  constructor(private readonly livesService: LivesService) {}

  @Get()
  async getOnAirLives(): Promise<LivesDto[]> {
    return await this.livesService.readLives({ onAir: true });
  }

  @Get('/:channelId')
  async getLive(@Param('channelId') channelId: UUID): Promise<LiveDto> {
    return await this.livesService.readLive(channelId);
  }

  @Patch('/:channelId')
  @HttpCode(204)
  async setLive(@Param('channelId') channelId: UUID, @Body(ValidationPipe) updateLiveDto: UpdateLiveDto) {
    await this.livesService.updateLive({ channelId, updateLiveDto });
  }

  @Get('/channel-id/:streamingKey')
  async getChannelId(@Param('streamingKey') streamingKey: UUID) {
    return await this.livesService.readChannelId(streamingKey);
  }

  @Post('/onair/:streamingKey')
  @HttpCode(200)
  async startLive(@Param('streamingKey') streamingKey: UUID) {
    await this.livesService.startLive(streamingKey);
    return { code: 0 };
  }

  @Delete('/onair/:channelId')
  @HttpCode(202)
  async endLive(@Param('channelId') channelId: UUID) {
    this.livesService.endLive(channelId);
  }

  @Get('/streaming-key')
  @UseGuards(JwtAuthGuard)
  async getStreamingKey(@Req() req: Request & { user: UserEntity }) {
    return { streamingKey: req.user.live.streamingKey };
  }
}

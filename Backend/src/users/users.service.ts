import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { UserEntity } from './entity/user.entity';
import { LiveEntity } from '../lives/entity/live.entity';
import { Repository, DataSource } from 'typeorm';
import { CreateUserDto } from './dto/create.user.dto';
import { UpdateUserDto } from './dto/update.user.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,

    @InjectRepository(LiveEntity)
    private livesRepository: Repository<LiveEntity>,

    @InjectDataSource()
    private connection: DataSource,
  ) {}

  async findByOAuthUid(
    oauthUid: string,
    oauthPlatform: 'naver' | 'github' | 'google',
  ): Promise<UserEntity | null> {
    return this.usersRepository.findOne({
      where: { oauthUid, oauthPlatform },
      relations: ['live'],
    });
  }

  async findById(id: number): Promise<UserEntity | null> {
    return this.usersRepository.findOne({
      where: { id },
      relations: ['live'],
    });
  }

  async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
    return this.connection.transaction(async manager => {
      const live = manager.create(LiveEntity, {
        categoriesId: null,
        channelId: randomUUID(),
        name: null,
        description: null,
        streamingKey: randomUUID(),
        onAir: false,
        startedAt: null,
      });
      const savedLive = await manager.save(LiveEntity, live);

      const newUser = manager.create(UserEntity, {
        ...createUserDto,
        live: savedLive,
      });
      return await manager.save(UserEntity, newUser);
    });
  }
  // 사용자 프로필 업데이트 메서드 추가
  async updateUser(userId: number, updateUserDto: UpdateUserDto): Promise<UserEntity> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    if (updateUserDto.nickname !== undefined) {
      user.nickname = updateUserDto.nickname;
    }

    if (updateUserDto.profileImage !== undefined) {
      user.profileImage = updateUserDto.profileImage;
    }

    return await this.usersRepository.save(user);
  }
}

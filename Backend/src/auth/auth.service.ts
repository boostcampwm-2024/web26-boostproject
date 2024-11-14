import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';

type OAuthPlatform = 'google' | 'github' | 'naver'; // platform 타입 정의 추가

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    private configService: ConfigService,
  ) {}

  async validateOAuthLogin(
    oauthUid: string,
    oauthPlatform: OAuthPlatform, // 타입 수정
    profileData: {
      nickname: string;
      profileImage?: string;
      email: string;
    },
  ) {
    let user = await this.usersService.findByOAuthUid(oauthUid, oauthPlatform);

    if (!user) {
      user = await this.usersService.createUser({
        oauthUid,
        oauthPlatform,
        nickname: profileData.nickname,
        profileImage: profileData.profileImage,
      });
    }

    const payload = {
      sub: {
        id: user.id,
        provider: user.oauthPlatform,
      },
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { expiresIn: '1h' }),
      this.jwtService.signAsync({ ...payload, type: 'refresh' }, { expiresIn: '7d' }),
    ]);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        nickname: user.nickname,
        profileImage: user.profileImage,
        channelId: user.live ? user.live.channelId : null, // channelId 추가
        liveId: user.live ? user.live.id : null, // liveId 추가
      },
    };
  }

  // Refresh 토큰 재발급
  async refreshTokens(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      const userId = payload.sub.id;
      const oauthPlatform = payload.sub.provider;

      // 사용자 조회
      const user = await this.usersService.findById(userId);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // 새로운 토큰 페이로드 구성
      const newPayload = {
        sub: {
          id: user.id,
          provider: user.oauthPlatform,
        },
      };

      // 새로운 Access 및 Refresh 토큰 생성
      const [newAccessToken, newRefreshToken] = await Promise.all([
        this.jwtService.signAsync(newPayload, { expiresIn: '1h' }),
        this.jwtService.signAsync(
          { ...newPayload, type: 'refresh' },
          { expiresIn: '7d' },
        ),
      ]);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user: {
          id: user.id,
          nickname: user.nickname,
          profileImage: user.profileImage,
          channelId: user.live.channelId, // channelId 추가
          liveId: user.live.id, // liveId 추가
        },
      };
    } catch (error) {
      console.error('Refresh Token Error:', error);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}

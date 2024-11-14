import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GOOGLE_REDIRECT_URI'),
      scope: ['email', 'profile', 'openid'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: Function
  ): Promise<any> {
    try {
      const { id: oauthUid, displayName, emails, photos } = profile;

      // Google 사용자 데이터 구성
      const userData = {
        oauthUid,
        provider: 'google' as 'google',
        nickname: displayName || emails?.[0]?.value?.split('@')[0] || `User${oauthUid.substring(0, 8)}`,
        profileImage: photos?.[0]?.value || null,
        email: emails?.[0]?.value || null,
      };

      done(null, userData);
    } catch (err) {
      console.error('Google Strategy Error:', err);
      done(err, false);
    }
  }
}
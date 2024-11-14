import {
  Controller,
  Get,
  Req,
  Res,
  UseGuards,
  Post,
  HttpCode,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
 

@Controller('auth')
export class AuthController {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {}

  // 콜백 엔드포인트 추가
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req: Request & { user: any }, @Res() res: Response) {
    return this.handleOAuthCallback(req, res);
  }

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubAuthCallback(@Req() req: Request & { user: any }, @Res() res: Response) {
    return this.handleOAuthCallback(req, res);
  }

  @Get('naver/callback')
  @UseGuards(AuthGuard('naver'))
  async naverAuthCallback(@Req() req: Request & { user: any }, @Res() res: Response) {
    return this.handleOAuthCallback(req, res);
  }

  @Get('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req: Request, @Res() res: Response) {
    try {
      // 클라이언트에서 전달된 accessToken이 유효한지 이미 JwtAuthGuard가 검증함

      // refreshToken 쿠키 제거
      res.cookie('refreshToken', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
        maxAge: 0,
        path: '/auth',
      });

      // 응답
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Logout Error:', error);
      res.status(500).json({ success: false, message: '로그아웃에 실패했습니다.' });
    }
  }

  // 공통 콜백 처리 메서드
  private async handleOAuthCallback(req: Request & { user: any }, res: Response) {
    try {
      if (!req.user) {
        throw new UnauthorizedException('OAuth 인증 실패');
      }

      const { accessToken, refreshToken, user } = await this.authService.validateOAuthLogin(
        req.user.oauthUid,
        req.user.provider,
        {
          nickname: req.user.nickname,
          profileImage: req.user.profileImage,
          email: req.user.email,
        },
      );


      res.cookie('refreshToken', refreshToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/auth',
      });

      // 프론트엔드에서 토큰을 받을 수 있도록 리다이렉트 또는 JSON 응답
      
      res.json({
        success: true,
        accessToken,
        user,
      });
    
    } catch (error) {
      console.error('OAuth Callback Error:', error);
      res.status(error.status || 401).json({
        success: false,
        message: error.message || 'Authentication failed',
      });
    }
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    try {
      const { accessToken, refreshToken: newRefreshToken, user } =
        await this.authService.refreshTokens(refreshToken);

      // 새로운 Refresh 토큰을 쿠키에 설정
      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
        path: '/auth',
      });

      // 응답
      res.status(200).json({
        accessToken,
        user,
      });
    } catch (error) {
      console.error('Refresh Token Error:', error);
      throw new UnauthorizedException('Could not refresh tokens');
    }
  }

}

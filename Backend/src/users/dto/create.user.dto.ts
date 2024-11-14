import { IsString, IsEnum, IsOptional, IsUrl } from 'class-validator';
export class CreateUserDto {
  @IsString()
  oauthUid: string;
  @IsEnum(['naver', 'github', 'google'])
  oauthPlatform: 'naver' | 'github' | 'google';
  @IsString()
  @IsOptional()
  nickname?: string;
  @IsUrl()
  @IsOptional()
  profileImage?: string | null;
}
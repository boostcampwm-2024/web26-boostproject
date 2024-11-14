import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ConfigService 가져오기
  const configService = app.get(ConfigService);

  // PORT 설정
  const port = configService.get<number>('PORT') || 3000;

  app.use(cookieParser()); // cookie-parser 미들웨어 사용
  app.enableCors({
    // CORS 설정
    origin: configService.get<string>('CORS').split(',') || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Authorization'],
  });

  await app.listen(port);
  console.log(`lico is running on: ${await app.getUrl()}`);
}
bootstrap();

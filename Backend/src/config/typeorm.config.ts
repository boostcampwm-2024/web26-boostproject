import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const typeOrmConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  const dbType = configService.get<string>('DB_TYPE');
  const dbConfig = configService.get(dbType);

  return {
    type: dbType,
    ...dbConfig,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: configService.get<boolean>('DB_SYNCHRONIZE'),
    logging: configService.get<boolean>('DB_SYNCHRONIZE'),
  };
};

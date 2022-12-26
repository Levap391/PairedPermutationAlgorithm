import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';

import { ConfigProvider } from './ConfigProvider';
import { ConfigService } from './ConfigService';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  providers: [ConfigProvider],
  exports: [ConfigService],
})
export class ConfigModule {}

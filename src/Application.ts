import { Module } from '@nestjs/common';
import { ConfigModule } from './Config';
import { TelegramModule } from './Telegram';

@Module({
  imports: [ConfigModule, TelegramModule],
  controllers: [],
  providers: [],
})
export class Application {}

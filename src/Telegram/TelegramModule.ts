import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { ConfigModule, ConfigService } from 'src/Config';
import { TelegramController, TelegramService } from './Providers';

@Module({
  imports: [
    ConfigModule,
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (_configService: ConfigService) => ({
        token: _configService.config.telegramToken,
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [TelegramController, TelegramService],
  exports: [TelegramService],
})
export class TelegramModule {}

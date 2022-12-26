import { Injectable } from '@nestjs/common';
import { Ctx, On, Start, Update } from 'nestjs-telegraf';
import { TelegramService } from './TelegramService';
import { Context } from 'telegraf';

@Update()
@Injectable()
export class TelegramController {
  constructor(private readonly _telegramService: TelegramService) {}

  @Start()
  public async start(@Ctx() ctx: Context) {
    await this._telegramService.start(ctx);
  }

  @On('text')
  public async text(@Ctx() ctx: Context) {
    await this._telegramService.start(ctx);
  }
}

import { Injectable } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';

@Injectable()
export class TelegramService {
  constructor(
    @InjectBot()
    private readonly _bot: Telegraf<Context>,
  ) {}

  public async start(ctx: Context) {
    await ctx.reply('Hi ' + ctx.from.username);
    return;
  }
}

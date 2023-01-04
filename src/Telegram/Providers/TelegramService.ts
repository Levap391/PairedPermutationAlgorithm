import { HttpModule, HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { response } from 'express';
import { InjectBot } from 'nestjs-telegraf';
import { ConfigService } from 'src/Config';
import { Context, Telegraf } from 'telegraf';

@Injectable()
export class TelegramService {
  constructor(
    @InjectBot()
    private readonly _bot: Telegraf<Context>,
    private readonly _axios: HttpService,
    private readonly _confixService: ConfigService,
  ) {}

  public async start(ctx: Context) {
    await ctx.reply('Hi ' + ctx.from.username);
    return;
  }

  private async _downloadFileTg(
    file_id: string,
    // file_name: string,
  ): Promise<Buffer> {
    const fileMete = await this._bot.telegram.getFile(file_id);

    console.log({ fileMete });

    const url = decodeURI(
      `https://api.telegram.org/file/bot${this._confixService.config.telegramToken}/${fileMete.file_path}`,
    );
    try {
      const res = await this._axios.axiosRef.get(url, {
        responseType: 'stream',
      });
      const buf = [];
      return new Promise((resolve, reject) => {
        return res.data
          .on('data', (chunk) => {
            buf.push(chunk);
          })
          .on('end', () => resolve(Buffer.concat(buf)))
          .on('error', reject);
      });
    } catch (error) {
      throw new Error(error);
    }
  }

  // private async _downloadFileTg(id: string, file_name: string): Promise<any> {
  //   // const writer = createWriteStream(process.cwd() + '/' + file_name);
  //   const whi = await this._bot.telegram.getFile(id);
  //   console.log({ whi });
  // }

  public async getFile(ctx: Context) {
    const ctxFlex: any = ctx;
    // console.log(ctx);
    let file;
    if ('document' in ctx.message) {
      file = ctx.message.document;
      console.log({ file });
      const fileBuffer = await this._downloadFileTg(file.file_id);
      console.log(fileBuffer.toString());
    }

    return;
  }
}

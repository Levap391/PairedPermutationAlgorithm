import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { findIndex } from 'lodash';
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
      // console.log(fileBuffer.toString());
      const a = await this._getMarxR(fileBuffer.toString());
      // for (const b of a) {
      //   // console.log(b);
      // }
    }

    return;
  }

  private async _getMarxR(bufStr: string) {
    // const clearbuf = bufStr.replace('\r\n', '');
    const lines = bufStr
      .replace(new RegExp(',\\r\\n          ', 'g'), ' ')
      .split(';\r\n');
    const nodes = [];
    const nodeComponentsName = [];

    for (const line of lines) {
      const node = line.substring(9);

      const components = node.split(' ');
      for (const component of components) {
        nodeComponentsName.push(component.replace(/\(.+\)/, ''));
      }

      nodes.push(node);
    }

    const componentNames = [...new Set(nodeComponentsName)].sort();
    console.log(componentNames);
    componentNames[0] = 'Name';

    const R = new Array(componentNames.length);

    console.log('-=-=-=-=-=-=-=-=-');
    console.log(R.length);

    for (let I = 0; I < R.length; I++) {
      if (I == 0) {
        R[I] = [...componentNames];
      } else {
        R[I] = new Array(componentNames.length);
        R[I][0] = componentNames[I];
      }
    }

    for (let I = 1; I < R.length; I++) {
      for (let J = 1; J < R.length; J++) {
        if (I == J) {
          R[I][J] = '-';
        } else {
          R[I][J] = 0;
        }
      }
    }

    for (const node of nodes) {
      const blocks: any[] = node.split(' ').map((q) => {
        return q.replace(/\(.+\)/, '');
      });

      if (blocks.length > 1) {
        let blockIndex1 = findIndex(componentNames, (name) => {
          return name == blocks[0];
        });

        for (let I = 1; I < blocks.length; I++) {
          const blockIndex2 = findIndex(componentNames, (name) => {
            return name == blocks[I];
          });

          // console.log('iteration = ', I);
          // console.log('i.1 ', blockIndex1, 'i.2 ', blockIndex2);

          R[blockIndex1][blockIndex2] = +R[blockIndex1][blockIndex2] + 1;
          R[blockIndex2][blockIndex1] = +R[blockIndex2][blockIndex1] + 1;

          blockIndex1 = blockIndex2;
        }
      }
    }

    this._seeMtrx(R);
    // console.log(nodes);
  }

  private _seeMtrx(matrix: any[]) {
    for (let I = 0; I < matrix.length; I++) {
      console.log(matrix[I].toString());
    }
  }
}

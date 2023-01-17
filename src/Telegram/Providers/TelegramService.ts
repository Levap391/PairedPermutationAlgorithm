import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { findIndex } from 'lodash';
import { Ctx, InjectBot } from 'nestjs-telegraf';
import nodeHtmlToImage from 'node-html-to-image';
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
    await ctx.reply(
      'Отправьте файл в формате Calay для получения матриц Q и R, c уважением ' +
        ctx.from.username,
    );
    return;
  }

  private async _downloadFileTg(file_id: string): Promise<Buffer> {
    const fileMete = await this._bot.telegram.getFile(file_id);

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

  public async getFile(ctx: Context) {
    let file;
    if ('document' in ctx.message) {
      file = ctx.message.document;
      const fileBuffer = await this._downloadFileTg(file.file_id);

      const RData = await this._getMarxR(fileBuffer.toString());

      const RImgBlob: any = await nodeHtmlToImage({
        html: RData,
      });

      await ctx.sendDocument({
        source: RImgBlob,
        filename: 'MatrixR.png',
      });

      const QData = await this._getMarxQ(fileBuffer.toString());

      const QImgBlob: any = await nodeHtmlToImage({
        html: QData,
      });

      await ctx.sendDocument({
        source: QImgBlob,
        filename: 'MatrixQ.png',
      });
    }

    return;
  }

  private async _getMarxR(bufStr: string) {
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

    componentNames[0] = 'Name';

    const R = new Array(componentNames.length);

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
          if (blockIndex1 === blockIndex2) {
            continue;
          }
          R[blockIndex1][blockIndex2] = +R[blockIndex1][blockIndex2] + 1;
          R[blockIndex2][blockIndex1] = +R[blockIndex2][blockIndex1] + 1;

          blockIndex1 = blockIndex2;
        }
      }
    }

    return this._matrixToHtml(R, 2, R[0].length, R.length);
  }
  private async _getMarxQ(bufStr: string) {
    const lines = bufStr
      .replace(new RegExp(',\\r\\n          ', 'g'), ' ')
      .split(';\r\n');
    const nodes = [];
    const nodeComponentsName = [];
    const nodeNames = [];

    for (const line of lines) {
      const node = line.substring(9);
      const [nodeName] = line.split(' ');
      nodeNames.push(nodeName);

      const components = node.split(' ');
      for (const component of components) {
        nodeComponentsName.push(component.replace(/\(.+\)/, ''));
      }

      nodes.push(node);
    }

    const componentNames = [...new Set(nodeComponentsName)].sort();

    componentNames[0] = 'Name';

    const Q = [componentNames];

    // Q[0] = componentNames;

    // for (let I = 0; I < Q.length; I++) {
    //   if (I == 0) {
    //     Q[I] = [...nodeNames];
    //   } else {
    //     Q[I] = new Array(componentNames.length);
    //     Q[I][0] = componentNames[I];
    //   }
    // }

    for (const line of lines) {
      const node = line.substring(9);
      const blocks: any[] = node.split(' ').map((q) => {
        return q.replace(/\(.+\)/, '');
      });

      const [nodeName] = line.split(' ');

      const nodeArr = new Array(componentNames.length);

      nodeArr[0] = nodeName;

      for (const block of blocks) {
        const indexBlock = findIndex(componentNames, (name) => {
          return name == block;
        });
        if (block == '') {
          continue;
        }

        nodeArr[indexBlock] = 1;
        for (let index = 0; index < nodeArr.length; index++) {
          if (nodeArr[index]) {
            continue;
          } else {
            nodeArr[index] = '-';
          }
        }
      }
      Q.push(nodeArr);
    }

    return this._matrixToHtml(Q, 2, Q[0].length, Q.length);
  }

  private _seeMtrx(matrix: any[]) {
    for (let I = 0; I < matrix.length; I++) {
      console.log(matrix[I].toString());
    }
  }

  private _matrixToHtml(
    matrix: any[],
    itemSize: number,
    widthLen: number,
    HiLen: number,
  ) {
    let divMat = '';
    const w = 30 * widthLen * itemSize;
    const h = HiLen * 30;

    for (const line of matrix) {
      for (const item of line) {
        divMat += `<div class="matrix-item${
          typeof item !== 'number' ? ' head' : ''
        }" style="width: ${30 * itemSize}px; height: ${30}px">${item}</div>`;
      }
    }

    const html = `
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body>
          <style>
              *{
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
              }

              body {
                width: ${w}px;
                height: ${h}px;
              }

              .matrix-container {
                  display: grid;
              }

              .matrix-item {
                  width: 30px;
                  height: 30px;
                  border: 1px solid black;
                  display: flex;
                  justify-content: center;
                  align-items: center;
              }

              .head {
                  background-color: gray;
                  color: white;
              }
          </style>
          <div class="matrix-container" id="matrix-container" style="grid-template-columns: repeat(${widthLen}, 1fr); width: 150px;">
          ${divMat}
          </div>
      </body>
      </html>
      `;

    return html;
  }
}

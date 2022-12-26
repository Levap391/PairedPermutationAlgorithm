import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

import { AppConfig } from './AppConfig';
import { KnownEnvironmentVariables } from './KnownEnvironmentVariables';

@Injectable()
export class ConfigService {
  constructor(
    private readonly _config: NestConfigService<KnownEnvironmentVariables>,
  ) {}

  private getEnvironmentVariables(
    key: keyof KnownEnvironmentVariables,
  ): string {
    const config = this._config;
    const variable = config.get(key);
    if (!variable) {
      console.error(`[!] Variable ${key} not found in .env`);
      process.exit(1);
    }

    return variable;
  }

  public get config(): AppConfig {
    return {
      telegramToken: this.getEnvironmentVariables('TELEGRAM_TOKEN'),
    };
  }
}

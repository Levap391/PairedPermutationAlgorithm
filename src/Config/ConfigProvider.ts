import { FactoryProvider } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

import { ConfigService } from './ConfigService';

export const ConfigProvider: FactoryProvider = {
  provide: ConfigService,
  useFactory: (config: NestConfigService): ConfigService => {
    return new ConfigService(config);
  },
  inject: [NestConfigService],
};

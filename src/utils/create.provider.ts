import {
  ConfigProvider,
  DynamicConfigProvider,
  DefinedConfigProvider,
} from '../types';
import { configToken } from './config.token';
import { Config } from '../config';
import * as path from 'path';
import { ClassProvider, ValueProvider } from '@nestjs/common/interfaces';

export function createProvider(
  configProvider: ConfigProvider,
  wholePath: string,
): ClassProvider | ValueProvider {
  const fileName = path.basename(wholePath, '.' + wholePath.split('.').pop());
  const provide =
    configProvider['prototype'] !== undefined &&
    typeof configProvider !== 'object'
      ? configProvider
      : configToken(
          configProvider.__provide
            ? configProvider.__provide
            : configProvider.__name
              ? configProvider.__name
              : fileName,
        );

  return isDynamicConfigProvider(configProvider)
    ? {
        provide,
        useClass: configProvider,
      }
    : {
        provide,
        useValue: new Config(configProvider),
      };
}

export function isDynamicConfigProvider(
  configProvider: ConfigProvider,
): configProvider is DynamicConfigProvider {
  return configProvider instanceof Function;
}

export function isDefinedConfigProvider(
  configProvider: ConfigProvider,
): configProvider is DefinedConfigProvider {
  return configProvider.__name || configProvider.__provide;
}

import { DynamicModule, Module, Global } from '@nestjs/common';
import { ConfigService, ConfigOptions } from './config.service';

@Global()
@Module({})
export class ConfigModule {
  /**
   * @param startPath
   * @deprecated
   */
  static resolveSrcPath(startPath: string): typeof ConfigModule {
    ConfigService.resolveSrcPath(startPath);
    return this;
  }

  /**
   * @param path
   */
  public static resolveRootPath(path: string): typeof ConfigModule {
    ConfigService.resolveRootPath(path);
    return this;
  }

  /**
   * From Glob
   * @param glob
   * @param {ConfigOptions} options
   * @returns {DynamicModule}
   */
  static load(glob: string, options?: ConfigOptions): DynamicModule {
    const configProvider = {
      provide: ConfigService,
      useFactory: async (): Promise<ConfigService> => {
        return ConfigService.load(glob, options);
      },
    };
    return {
      module: ConfigModule,
      providers: [configProvider],
      exports: [configProvider],
    };
  }
}

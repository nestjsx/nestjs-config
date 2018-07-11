import { DynamicModule, Module, Global } from '@nestjs/common';
import { ConfigService } from './config.service';
import { DotenvOptions } from 'dotenv';

@Global()
@Module({})
export class ConfigModule {
  /**
   * From Glob
   * @param glob
   * @param {DotenvOptions} options
   * @returns {DynamicModule}
   */
  static load(pattern?: string, options?: DotenvOptions): DynamicModule {
    const configProvider = {
      provide: ConfigService,
      useFactory: async (): Promise<any> => {
        return ConfigService.load(pattern, options);
      },
    };
    return {
      module: ConfigModule,
      providers: [configProvider],
      exports: [configProvider],
    };
  }
}

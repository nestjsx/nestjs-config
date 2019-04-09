import {Module, Global, DynamicModule, Provider} from '@nestjs/common';
import { ConfigService } from './config.service';
import {createProvider} from './utils';
import {ConfigProvider} from './types';
import {DotenvConfigOptions} from 'dotenv';
import {IConfigModuleOptions} from './interfaces';

@Global()
@Module({
  providers: [ConfigService],
})
export class ConfigModule {

	/**
	 * @param path
	 */
  public static resolveRootPath(path: string): ConfigModule {
    ConfigService.resolveRootPath(path);
    return ConfigModule;
  }

	/**
	 * @param config
	 * @param options
	 */
  public static forRoot(config: ConfigProvider, options?: DotenvConfigOptions): DynamicModule {
		ConfigService.loadDotEnv(options);
		const providers = [createProvider(config, ''), ConfigService];

		return {
			module: ConfigModule,
			providers,
			exports: providers,
		};
	}

	/**
	 * @param options
	 */
	public static async forRootAsync(options: string | IConfigModuleOptions): Promise<DynamicModule> {
		ConfigService.loadDotEnv(typeof options === 'object' ? options.dotenv : undefined);
		const providers: Provider[] = await ConfigService.createProviders(typeof options === 'object' ? options.glob : options);
		providers.push(ConfigService);

		return {
			module: ConfigModule,
			providers,
			exports: providers,
		};
	}

	public async forRootAsync(options: string | IConfigModuleOptions): Promise<DynamicModule> {
		return ConfigModule.forRootAsync(options);
	}
}

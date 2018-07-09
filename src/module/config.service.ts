import { Injectable } from '@nestjs/common';
import * as get from 'lodash.get';
import * as set from 'lodash.set';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { Glob } from 'glob';
import { DotenvOptions } from 'dotenv';

export interface ModuleConfig {
  [key: string]: any;
}

export interface Config {
  [key: string]: ModuleConfig;
}

@Injectable()
export class ConfigService {
  private readonly config: object;

  /**
   * @param {Config} config
   */
  constructor(config: Config = {}) {
    this.config = config;
  }

  /**
   * Default dotenv config point to a .env
   * on the cwd path
   * @returns {{path: string}}
   */
  protected static defaultDotenvConfig() {
    return {
      path: path.join(process.cwd(), '.env'),
    };
  }

  /**
   * Load configuration from file system
   * @param glob string
   * @param {DotenvOptions} options
   * @returns {Promise<any>}
   */
  static async load(
    glob: string,
    options?: DotenvOptions | false,
  ): Promise<ConfigService> {
    const configs = await this.loadConfigFromGlob(glob, options);

    return new ConfigService(configs);
  }

  /**
   * Get the param or use default
   *
   * @param param
   * @param value default
   * @returns {any}
   */
  get(param: string | string[], value: any = undefined): any {
    const configValue = get(this.config, param);

    if (configValue === undefined) {
      return value;
    }

    return configValue;
  }

  /**
   * Set config value at runtime
   * @param {string} param
   * @param value
   * @returns {Config}
   */
  set(param: string | string[], value: any = null): Config {
    return set(this.config, param, value);
  }

  /**
   * Check the param exists
   *
   * @param param
   * @returns {boolean}
   */
  has(param: string | string[]): boolean {
    return get(this.config, param) !== undefined;
  }

  /**
   * Merge configuration
   * @param glob
   * @param options
   */
  async merge(glob: string, options?: DotenvOptions): Promise<void> {
    const config = await ConfigService.loadConfigFromGlob(glob, options);

    Object.keys(config).forEach(configName => {
      this.config[configName] = config[configName];
    });
  }

  /**
   * @param {string} dir
   * @returns {string}
   */
  static root(dir: string = ''): string {
    return `${process.cwd()}${dir || `/${dir}`}`;
  }

  /**
   * @param {string} dir
   * @returns {string}
   */
  static src(dir: string = ''): string {
    return ConfigService.root(`src${dir || `/${dir}`}`);
  }

  /**
   * @param {string | string[]} glob
   * @param {DotenvOptions | false} options
   * @returns {Promise<Config>}
   */
  protected static loadConfigFromGlob(
    glob: string,
    options?: DotenvOptions | false,
  ): Promise<Config> {
    return new Promise((resolve, reject) => {
      new Glob(glob, {}, (err, matches) => {
        /* istanbul ignore if */
        if (err) {
          reject(err);
        } else {
          if (options !== false) {
            dotenv.load(options || ConfigService.defaultDotenvConfig());
          }

          const configs = this.configGraph(matches);

          resolve(configs);
        }
      });
    });
  }

  /**
   * Config graph from an array of paths
   * @param configPaths
   * @returns {any}
   */
  protected static configGraph(configPaths: string[]) {
    return configPaths.reduce((configs: Config, file: string) => {
      const module = require(file);
      const config = module.default || module;
      const configName = this.getConfigName(file);

      configs[configName] = config;

      return configs;
    }, {});
  }

  /**
   * Get config name from a file path
   * @param {string} file
   * @returns {string}
   */
  protected static getConfigName(file: string) {
    return file
      .split(path.sep)
      .pop()
      .replace('.js', '')
      .replace('.ts', '');
  }
}
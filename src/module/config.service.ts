import { Injectable } from '@nestjs/common';
import * as assert from 'assert';
import * as get from 'lodash.get';
import * as set from 'lodash.set';
import { DotenvConfigOptions, config as dotenv } from 'dotenv';
import * as path from 'path';
import { Glob, sync as globSync } from 'glob';
import { ProxyProperty } from '../decorators/proxy';

export interface ModuleConfig {
  [key: string]: any;
}

export interface Config {
  [key: string]: ModuleConfig;
}

export type CustomHelper = {
  [key: string]: (...args: any[]) => any;
};

export interface ConfigOptions extends Partial<DotenvConfigOptions> {
  modifyConfigName?: (name: string) => string;
}

@Injectable()
@ProxyProperty('helpers')
export class ConfigService {
  [key: string]: Config | CustomHelper | ((...args: any[]) => any) | any;

  private static config: Config;
  private readonly helpers: CustomHelper = {};

  public static rootPath?: string;

  /**
   * @deprecated use rootPath instead
   */
  public static srcPath?: string;

  /**
   * @param {Config} config
   */
  constructor(config: Config = {}) {
    this.bindCustomHelpers(config);
    ConfigService.config = config;
  }

  /**
   * Load configuration from file system
   * @param glob string
   * @param {DotenvOptions} options
   * @returns {Promise<any>}
   */
  static async load(
    glob: string,
    options?: ConfigOptions | false,
  ): Promise<ConfigService> {
    console.log(
      `\x1b[33m%s\x1b[0m`,
      `WARNING: Method 'load' will be deprecated as of v2.0.0. Please refer to documentation for forRootAsync usage`,
    );

    const configs = await this.loadConfigAsync(glob, options);
    return new ConfigService(configs);
  }

  /**
   * Load config synchronously
   * @param {string} glob
   * @param {DotenvOptions | false} options
   */
  static loadSync(glob: string, options?: ConfigOptions | false) {
    const configs = this.loadConfigSync(glob, options);

    return new ConfigService(configs);
  }

  /**
   * Get the param or use default
   *
   * @param {String} key
   * @param {any} value default
   * @returns {any|undefined}
   */
  static get(param: string | string[], value: any = undefined): any {
    const configValue = get(ConfigService.config, param);

    if (configValue === undefined) {
      return value;
    }
    return configValue;
  }

  /**
   * Get the param or use default
   *
   * @param param
   * @param {any} value default
   * @returns {any}
   */
  get(param: string | string[], value: any = undefined): any {
    return ConfigService.get(param, value);
  }

  /**
   * Set config value at runtime
   * @param {string} param
   * @param value
   * @returns {Config}
   */
  set(param: string | string[], value: any = null): Config {
    console.log(
      `\x1b[33m%s\x1b[0m`,
      `WARNING: Method 'set' will be deprecated as of v2.0.0`,
    );
    return set(ConfigService.config, param, value);
  }

  /**
   * Check the param exists
   *
   * @param param
   * @returns {boolean}
   */
  has(param: string | string[]): boolean {
    return get(ConfigService.config, param) !== undefined;
  }

  /**
   * Merge configuration
   * @param glob
   * @param options
   */
  async merge(glob: string, options?: ConfigOptions): Promise<void> {
    const config = await ConfigService.loadConfigAsync(glob, options);

    console.log(
      `\x1b[33m%s\x1b[0m`,
      `WARNING: Method 'merge' will be deprecated as of v2.0.0`,
    );

    Object.keys(config).forEach(configName => {
      ConfigService.config[configName] = config[configName];
    });
  }

  /**
   * Merge configuration synchronously
   * @param {string} glob
   * @param {DotenvOptions} options
   * @returns {ConfigService}
   */
  mergeSync(glob: string, options?: ConfigOptions): ConfigService {
    const config = ConfigService.loadConfigSync(glob, options);

    Object.keys(config).forEach(configName => {
      ConfigService.config[configName] = config[configName];
    });

    return this;
  }

  /**
   * @param {string} name
   * @param {CustomHelper} fn
   * @returns {ConfigService}
   */
  registerHelper(name: string, fn: (...args: any[]) => any): ConfigService {
    this.helpers[name] = fn.bind(this);

    console.log(
      `\x1b[33m%s\x1b[0m`,
      `WARNING: Method 'registerHelper' will be deprecated as of v2.0.0`,
    );

    return this;
  }

  /**
   * @param {string} dir
   * @returns {string}
   */
  public static root(dir: string = ''): string {
    const rootPath =
      this.rootPath || this.srcPath || path.resolve(process.cwd());
    return path.resolve(rootPath, dir);
  }

  /**
   * @param {string} dir
   * @returns {string}
   *
   * @deprecated use configService.root() instead
   */
  public static src(dir: string = ''): string {
    console.log(
      `\x1b[33m%s\x1b[0m`,
      `WARNING: Method 'src' has been deprecated. Please use 'root'`,
    );
    return this.root(dir);
  }

  /**
   * Resolves and stores sources directory for application.
   * @param {string} startPath
   *  The path for search starting. Can be any path under app sources path.
   */
  public static resolveRootPath(startPath: string): typeof ConfigService {
    assert.ok(
      path.isAbsolute(startPath),
      'Start path must be an absolute path.',
    );

    if (!this.rootPath) {
      const root = this.root();

      let workingDir = startPath;
      let parent = path.dirname(startPath);

      while (workingDir !== root && parent !== root && parent !== workingDir) {
        workingDir = parent;
        parent = path.dirname(workingDir);
      }

      this.rootPath = workingDir;
      this.srcPath = workingDir;
    }

    return this;
  }

  /**
   * @param startPath
   *
   * @deprecated use configService.resolveRootPath() instead
   */
  public static resolveSrcPath(startPath: string): typeof ConfigService {
    console.log(
      `\x1b[33m%s\x1b[0m`,
      `WARNING: Method 'resolveSrcPath' has been deprecated. Please use 'resolveRootPath'`,
    );
    return this.resolveRootPath(startPath);
  }

  /**
   * @param {string | string[]} glob
   * @param {DotenvOptions | false} options
   * @returns {Promise<Config>}
   */
  protected static loadConfigAsync(
    glob: string,
    options?: ConfigOptions | false,
  ): Promise<Config> {
    glob = this.root(glob);
    return new Promise((resolve, reject) => {
      new Glob(glob, {}, (err, matches) => {
        /* istanbul ignore if */
        if (err) {
          reject(err);
        } else {
          this.loadEnv(options);

          const configs = this.configGraph(
            matches,
            options && options.modifyConfigName,
          );

          resolve(configs);
        }
      });
    });
  }

  /**
   * Load config synchronously
   * @param {string} glob
   * @param {DotenvOptions | false} options
   * @returns {Config}
   */
  protected static loadConfigSync(
    glob: string,
    options?: ConfigOptions | false,
  ): Config {
    glob = this.root(glob);
    const matches = globSync(glob);
    this.loadEnv(options);

    return this.configGraph(matches, options && options.modifyConfigName);
  }

  /**
   * Config graph from an array of paths
   * @param configPaths
   * @param modifyConfigName
   * @returns {any}
   */
  protected static configGraph(
    configPaths: string[],
    modifyConfigName?: (name: string) => string,
  ) {
    return configPaths.reduce((configs: Config, file: string) => {
      const module = require(file);
      const config = module.default || module;
      const configName = modifyConfigName
        ? modifyConfigName(this.getConfigName(file))
        : this.getConfigName(file);

      configs[configName] = config;

      return configs;
    }, {});
  }

  /**
   * @param config
   * @returns {string}
   */
  protected bindCustomHelpers(config) {
    return Object.keys(config).reduce((configObj, configName) => {
      if (typeof configObj[configName] === 'function') {
        const helper = configObj[configName].bind(this);
        configObj[configName] = helper;
        this.helpers[`_${configName}`] = helper;
      }

      if (
        typeof configObj[configName] === 'object' &&
        configObj[configName] !== null
      ) {
        configObj[configName] = this.bindCustomHelpers(configObj[configName]);
      }

      return configObj;
    }, config);
  }

  /**
   * Get config name from a file path
   * @param {string} file
   * @returns {string}
   */
  protected static getConfigName(file: string) {
    const ext = path.extname(file);
    return path.basename(file, ext);
  }

  /**
   * Loads env variables via dotenv.
   * @param {DotenvConfigOptions | false} options
   */
  protected static loadEnv(options?: DotenvConfigOptions | false): void {
    if (options !== false) {
      dotenv(options || ConfigService.defaultDotenvConfig());
    }
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
}

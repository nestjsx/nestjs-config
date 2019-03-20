import {Injectable, Provider, Type} from '@nestjs/common';
import {ModuleRef} from '@nestjs/core';
import {DotenvConfigOptions} from 'dotenv';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as assert from 'assert';
import {Glob} from 'glob';
import * as get from 'lodash.get';
import {TOKEN_PREFIX} from './constants';
import {ConfigProvider} from './types';
import { UnkownConfigProvider } from './exceptions';
import {createProvider} from './utils';
import {Config} from './config';

@Injectable()
export class ConfigService {

	protected static rootPath?: string;
	protected static tokenReferences: {[s: string]: string | symbol | Type<any>} = {};
	protected static mode: 'sync' | 'async' = 'sync';
	protected static dotenvOptions = {};

	/**
	 * @param moduleRef 
	 */
	constructor(private readonly moduleRef: ModuleRef) {}

	/**
	 * @param options 
	 */
	public static loadDotEnv(options?: DotenvConfigOptions | false): void {
		if (options !== false) dotenv.load(options || this.dotenvOptions);
	}

	/**
	 * @param dir 
	 */
	public static root(dir: string = ''): string {
		const rootPath =
      this.rootPath || path.resolve(process.cwd());
    return path.resolve(rootPath, dir);
	}

	/**
	 * @param dir 
	 */
	public static resolveRootPath(dir: string): typeof ConfigService {
		assert.ok(
      path.isAbsolute(dir),
      'Start path must be an absolute path.',
		);
		if (!this.rootPath) {
      const root = this.root();

      let workingDir = dir;
      let parent = path.dirname(dir);

      while (workingDir !== root && parent !== root && parent !== workingDir) {
        workingDir = parent;
        parent = path.dirname(workingDir);
      }

      this.rootPath = workingDir;
		}
		
		return this;
	}

	/**
	 * @param glob 
	 */
  public static async getConfigFiles(glob: string): Promise<string[]> {
		return new Promise((resolve, rejects) => {
			new Glob(glob, {
				cwd: this.root(),
			}, (err, matches) => {
				if (err) {
					rejects(err);
				} else {
					resolve(matches);
				}
			});
		});
	}

	/**
	 * @param glob 
	 */
	public static async createProviders(glob: string): Promise<Provider[]> {
		ConfigService.mode = 'async';
		const files = await this.getConfigFiles(glob);
		const providers: Provider[] = [];
		
		files.forEach(file => {
			providers.push(this.loadFile(file));
		});

		return providers;
	}

	/**
	 * @param file 
	 */
	public static loadFile(file: string): Provider {
		const required = require(file);
		const provider = createProvider(required.default, file);

		if (!provider.hasOwnProperty('useClass')) {
			this.setReference(
				required.default.__name || required.default.__provide || path.basename(file, '.' + file.split('.').pop()), 
				provider.provide
			);
		}

		return provider;
	}

	/**
	 * @param token
	 */
	protected findConfigProvider(token: string | symbol | Type<any>): ConfigProvider | null {
		return this.moduleRef.get(token);
	}

	/**
	 * @param name
	 */
	protected resolveTokenFromName(name: string): string | symbol | Type<any> {
		const token = this.has(name) ? ConfigService.tokenReferences[name] : null;
		if (token === null) {
			throw new UnkownConfigProvider(name);
		}

		return token;
  }
  
  /**
   * @param name
   */
  public has(name: string): boolean {
    return Object.keys(ConfigService.tokenReferences).includes(name);
  }

	/**
	 * @param name
	 * @param token
	 */
	protected static setReference(name: string, token: string | symbol | Type<any>): typeof ConfigService {
		ConfigService.tokenReferences[name] = token;
		return this;
	}

	/**
	 * @param pattern
	 */
	protected getNameAndAshPatternFromPattern(pattern: string): [string, string] {
		const parts = pattern.split('.');
		return [parts.shift(), parts.join('.')];
	}

	/**
	 * @param pattern
	 * @param value
	 */
	public get<T>(pattern: string, value: any = undefined): T | undefined {

		let provider: ConfigProvider | null;
		let ashPattern: string;
		let name: string;

		if (ConfigService.mode === 'sync') {
			[name, ashPattern] = this.getNameAndAshPatternFromPattern(pattern);
			provider = this.findConfigProvider(`${TOKEN_PREFIX}${ashPattern ? name : ''}`);
			
			if (ashPattern === '') {
				ashPattern = name;
			}
		} else {
			[name, ashPattern] = this.getNameAndAshPatternFromPattern(pattern);
			provider = this.findConfigProvider(this.resolveTokenFromName(name));
		}

		if (!provider) {
			return value;
		}

		if (provider instanceof Config) {
			return provider.get<T>(ashPattern, value);
		} 
		
		const result = get(provider, ashPattern);

		return result ? result : value;
	}
}

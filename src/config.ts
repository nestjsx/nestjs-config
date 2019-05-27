import * as get from 'lodash.get';
import { IConfig } from './types';

export class Config implements IConfig {

  /**
   * @param config
   */
  constructor(config: {[s: string]: any}) {
    Object.keys(config).forEach(key => this[key] = config[key]);
  }

  /**
   * @param pattern
   * @param value
   */
  get<T>(pattern: string, value: any = undefined): T {
		const fetched = get(this, pattern);

		return typeof fetched !== 'undefined' ? fetched : value;
	}
}

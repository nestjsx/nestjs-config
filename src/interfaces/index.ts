import { DotenvConfigOptions } from 'dotenv';

export interface IConfigModuleOptions {
  glob: string;
  dotenv: DotenvConfigOptions;
}

import { Inject } from '@nestjs/common';
import { configToken } from './../utils';
import { ConfigService } from './../config.service';

export function InjectConfig(token: string = '') {
  return Inject(configToken(token));
}

export function InjectConfigService() {
  return Inject(ConfigService);
}

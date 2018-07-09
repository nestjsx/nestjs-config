import * as path from 'path';
import { ConfigService } from '../module/index';
import { async } from 'rxjs/internal/scheduler/async';

describe('Config Service', () => {
  describe('Will load configurations from given a glob', () => {
    let configService: ConfigService;
    beforeEach(async () => {
      configService = await ConfigService.load(
        path.resolve(__dirname, '__stubs__', '*.stub.ts'),
        false,
      );
    });

    it('Will return the value from a previously loaded config', () => {
      expect(configService.get(['config.stub', 'port'])).toEqual(2000);
    });

    it('Will return a given default value if the config path is not found', () => {
      expect(configService.get('notfound', 30000)).toEqual(30000);
    });

    it('Will set some config at runtime', () => {
      configService.set('graphql.port', 2000);
      expect(configService.get('graphql.port')).toEqual(2000);
    });

    it('Will check if the a config path exists', () => {
      expect(configService.has('notfound')).toBeFalsy();
      expect(configService.has(['config.stub', 'port'])).toBeTruthy();
    });

    it('Will merge other config from file system', async () => {
      await configService.merge(
        path.resolve(__dirname, '__stubs__', '*.server.ts'),
      );

      expect(configService.get(['config.server', 'port'])).toEqual(2000);
    });
  });

  describe('Will load configuration with a .env file', () => {
    let configService: ConfigService;
    beforeEach(async () => {
      configService = await ConfigService.load(
        path.resolve(__dirname, '__stubs__', '*.env.ts'),
        { path: path.resolve(__dirname, '__stubs__', '.env') },
      );
    });

    it('Will use a variable provided by the .env file', () => {
      expect(configService.get(['config.env', 'project'])).toEqual(
        'nest-config',
      );
    });
  });
});

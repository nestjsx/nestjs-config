import * as path from 'path';
import { ConfigService } from '../module';

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

    it('Will load config synchronously', () => {
      const syncConfigService = ConfigService.loadSync(
        path.resolve(__dirname, '__stubs__', '*.stub.ts'),
        false,
      );

      expect(syncConfigService.get(['config.stub', 'port'])).toEqual(2000);
    });

    it('Will merge other config from file system synchronously', () => {
      configService.mergeSync(
        path.resolve(__dirname, '__stubs__', '*.server.ts'),
      );

      expect(configService.get(['config.server', 'port'])).toEqual(2000);
    });

    it('Will invoke custom helper methods', () => {
      expect(configService._isProductionPort()).toEqual(true);
    });

    it('Will invoke custom helper methods from config', () => {
      expect(configService.get('config.stub').isProductionPort()).toEqual(true);
    });

    it('Will register custom helper', () => {
      configService.registerHelper('environment', () => {
        return 'custom';
      });
      expect(configService.environment()).toEqual('custom');
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

    it('Will return a root directory', () => {
      const realProcessCwd = process.cwd;

      const mockedCwdPath = __dirname;
      process.cwd = () => mockedCwdPath;

      const expectedPath = path.join(mockedCwdPath, 'app');
      expect(ConfigService.root('app')).toEqual(expectedPath);

      process.cwd = realProcessCwd;
    });

    it('Will return a src directory', () => {
      const realProcessCwd = process.cwd;

      const mockedCwdPath = __dirname;
      process.cwd = () => mockedCwdPath;

      const expectedPath = path.join(mockedCwdPath, 'src', 'config');
      expect(ConfigService.src('config')).toEqual(expectedPath);

      process.cwd = realProcessCwd;
    });
  });
});

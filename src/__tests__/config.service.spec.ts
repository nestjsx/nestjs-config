import { Test, TestingModule } from '@nestjs/testing';
import * as path from 'path';
import { ConfigService } from '../config.service';
import { ConfigModule } from './../config.module';
import { InjectConfigService } from './../decorators';
import { Config } from '../config';

describe('ConfigService', () => {
  it('ConfigService can call get with __provide reference', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRootAsync(
          path.resolve(__dirname, '__stubs__', 'config', '**/!(*.d).{ts,js}'),
        ),
      ],
    }).compile();

    const service = module.get(ConfigService);

    expect(service.get('set_by_manual.test')).toBe(3000);
  });

  it('ConfigService can call get with __name reference', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRootAsync(
          path.resolve(__dirname, '__stubs__', 'config', '**/!(*.d).{ts,js}'),
        ),
      ],
    }).compile();

    const service = module.get(ConfigService);

    expect(service.get('tester_test.test')).toBe('hello');
  });

  it('ConfigService can call get with file name reference', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRootAsync(
          path.resolve(__dirname, '__stubs__', 'config', '**/!(*.d).{ts,js}'),
        ),
      ],
    }).compile();

    const service = module.get(ConfigService);

    expect(service.get('file_named.test')).toBe('hello again');
  });

  it('ConfigService can inject with decorator', async () => {
    class TestClass {
      constructor(
        @InjectConfigService() private readonly configService: ConfigService,
      ) {}

      getConfig() {
        return this.configService;
      }
    }

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRootAsync(
          path.resolve(__dirname, '__stubs__', 'config', '**/!(*.d).{ts,js}'),
        ),
      ],
      providers: [TestClass],
    }).compile();

    const service = module.get(TestClass);

    expect(service.getConfig()).toBeInstanceOf(ConfigService);
  });

  it('ConfigService can inject with decorator with sync', async () => {
    class TestClass {
      constructor(
        @InjectConfigService() private readonly configService: ConfigService,
      ) {}

      getConfig() {
        return this.configService;
      }
    }

    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({})],
      providers: [TestClass],
    }).compile();

    const service = module.get(TestClass);

    expect(service.getConfig()).toBeInstanceOf(ConfigService);
  });

  it('Can get just provider', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRootAsync(
          path.resolve(__dirname, '__stubs__', 'config', '**/!(*.d).{ts,js}'),
        ),
      ],
    }).compile();

    const config = module.get<ConfigService>(ConfigService);

    expect(config.get<Config>('config')).toBeInstanceOf(Config);
    expect(config.get<Config>('config').port).toBe(2000);
    expect(config.get<Config>('config').get('port')).toBe(2000);
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from './../index';
import * as path from 'path';
import TestConfigClass from './__stubs__/config/test';
import { configToken } from './../utils';
import { Config } from '../config';
import { InjectConfig, InjectConfigService } from '../decorators';
import { UnkownConfigProvider } from '../exceptions';
import { ConfigService } from '../config.service';

describe('ConfigModule.forRootAsync', () => {
  it('can instance', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRootAsync({
          glob: path.resolve(
            __dirname,
            '__stubs__',
            'config',
            '**/!(*.d).{ts,js}',
          ),
          dotenv: {
            path: path.resolve(__dirname, '__stubs__', '.env'),
          },
        }),
      ],
    }).compile();

    expect(module.get(ConfigModule)).toBeInstanceOf(ConfigModule);
  });

  it('Should Have provider TestConfigClass', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRootAsync(
          path.resolve(__dirname, '__stubs__', 'config', '**/!(*.d).{ts,js}'),
        ),
      ],
    }).compile();

    expect(module.get(TestConfigClass)).toBeInstanceOf(TestConfigClass);
  });

  it('Should have manual provider', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRootAsync(
          path.resolve(__dirname, '__stubs__', 'config', '**/!(*.d).{ts,js}'),
        ),
      ],
    }).compile();

    expect(module.get(configToken('set_by_manual'))).toBeInstanceOf(Config);
  });

  it('Should be able to inject defined config', async () => {
    class TestClass {
      constructor(
        @InjectConfig('set_by_manual') private readonly config: Config,
      ) {}

      getConfig() {
        return this.config.get<number>('test');
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

    expect(module.get(TestClass).getConfig()).toBe(3000);
  });

  it('Should be able to inject file named config', async () => {
    class TestClass {
      constructor(
        @InjectConfig('file_named') private readonly config: Config,
      ) {}

      getConfig() {
        return this.config.get<string>('test');
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

    expect(module.get(TestClass).getConfig()).toBe('hello again');
  });

  it('Should be able to inject __provide over __name config', async () => {
    class TestClass {
      constructor(
        @InjectConfig('testy_test') private readonly config: Config,
      ) {}

      getConfig() {
        return this.config.get<string>('test');
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

    expect(module.get(TestClass).getConfig()).toBe('hello');
  });

  it('Should be able to inject ConfigService', async () => {
    class TestClass {
      constructor(
        @InjectConfigService() private readonly config: ConfigService,
      ) {}

      getConfig() {
        return this.config;
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

    expect(module.get(TestClass).getConfig()).toBeInstanceOf(ConfigService);
  });

  it("Throw exception when config provider doesn't exist", async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRootAsync(
          path.resolve(__dirname, '__stubs__', 'config', '**/!(*.d).{ts,js}'),
        ),
      ],
    }).compile();
    let result;

    try {
      module.get(ConfigService).get('doesnotexist');
    } catch (e) {
      result = e;
    }

    expect(result).toBeInstanceOf(UnkownConfigProvider);
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '../index';
import { InjectConfig } from '../decorators';
import { Config } from '../config';

describe('ConfigModule.forRoot', () => {
  it('can instance', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          test: true,
        }),
      ],
    }).compile();

    expect(module.get(ConfigModule)).toBeInstanceOf(ConfigModule);
  });

  it('Should have ConfigService provider', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          test: true,
        }),
      ],
    }).compile();

    const provider = module.get(ConfigService);

    expect(provider).toBeInstanceOf(ConfigService);
  });

  it('Should be able to obtain config', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          test: true,
        }),
      ],
    }).compile();

    const provider = module.get(ConfigService);

    expect(provider.get('test')).toBe(true);
  });

  it('Can inject config', async () => {
    class TestClass {
      constructor(@InjectConfig() private readonly config: Config) {}

      getConfig() {
        return this.config.get<boolean>('test');
      }
    }

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          test: true,
        }),
      ],
      providers: [TestClass],
    }).compile();

    expect(module.get(TestClass).getConfig()).toBe(true);
  });

  it('Should be able to define provider', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          __provide: 'testings',
          test: true,
        }),
      ],
    }).compile();

    const provider = module.get(ConfigService);

    expect(provider.get('testings.test')).toBe(true);
  });

  it('Can inject defined config', async () => {
    class TestClass {
      constructor(@InjectConfig('testings') private readonly config: Config) {}

      getConfig() {
        return this.config.get<boolean>('test');
      }
    }

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          __provide: 'testings',
          test: true,
        }),
      ],
      providers: [TestClass],
    }).compile();

    expect(module.get(TestClass).getConfig()).toBe(true);
  });

  it('Can get just provider with forRoot', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          test: {
            something: {
              somethingelse: 'test',
            },
          },
        }),
      ],
    }).compile();

    const provider = module.get(ConfigService);

    expect(provider.get('test')).toEqual({
      something: {
        somethingelse: 'test',
      },
    });
  });
});

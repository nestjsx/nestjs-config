import { Test, TestingModule } from '@nestjs/testing';
import * as path from 'path';
import { ConfigModule, ConfigService } from '../index';
import { Injectable } from '@nestjs/common';
import { InjectConfig, InjectConfigService } from '../decorators';
import { Config } from '../config';

describe('ConfigModule', () => {
  it('Will boot nest-config module succesfully', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRootAsync(
          path.resolve(__dirname, '__stubs__', '**/*.ts'),
        ),
      ],
    }).compile();

    const configService = module.get<ConfigService>(ConfigService);

    expect(configService.get('config.server')).toBeTruthy();
    expect(configService.get('config.stub')).toBeTruthy();
  });

  it('Will resolve application sources path with root', async () => {
    const spy = jest.spyOn(ConfigService, 'resolveRootPath');

    await Test.createTestingModule({
      imports: [
        ConfigModule.resolveRootPath(__dirname).forRootAsync(
          path.resolve('__stubs__', 'config.*.ts'),
        ),
      ],
    }).compile();

    const expectedAppRootPath = path.resolve(process.cwd(), 'src');

    expect(spy).toHaveBeenCalled();
    expect(ConfigService.rootPath).toEqual(expectedAppRootPath);
  });

  it('Will Setup Modules with its Components', async () => {
    @Injectable()
    class ComponentTest {
      constructor(
        @InjectConfig('config.server')
        private readonly configKey?: { port: number },
      ) {}

      testConfig() {
        return this.configKey;
      }
    }

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRootAsync(
          path.resolve(__dirname, '__stubs__', '**/*.ts'),
        ),
      ],
      providers: [ComponentTest],
    }).compile();

    const componentTest = module.get<ComponentTest>(ComponentTest);

    expect(componentTest.testConfig()).toEqual({ port: 2000 });
    expect(componentTest.testConfig()).toBeInstanceOf(Config);
  });

  it('Multiple ConfigParam decorators', async () => {
    @Injectable()
    class ComponentTest {
      constructor(
        @InjectConfig('config.server')
        private readonly server?: { port: number },
        @InjectConfig('config.stub') private readonly stub?: { port: number },
      ) {}

      testConfig() {
        return { serverPort: this.server.port, stubPort: this.stub.port };
      }
    }

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRootAsync(
          path.resolve(__dirname, '__stubs__', '**/*.ts'),
        ),
      ],
      providers: [ComponentTest],
    }).compile();

    const componentTest = module.get<ComponentTest>(ComponentTest);

    expect(componentTest.testConfig()).toEqual({
      serverPort: 2000,
      stubPort: 2000,
    });
  });
});

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
});

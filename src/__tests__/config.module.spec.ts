import { Test, TestingModule } from '@nestjs/testing';
import * as path from 'path';
import { ConfigModule, ConfigService } from '../index';
import { Injectable } from '@nestjs/common';
import { InjectConfig } from '../decorators';
import { Config } from '../config';

describe('ConfigModule', () => {
  it('Will boot nest-config module succesfully', async () => {
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

    const configService = module.get<ConfigService>(ConfigService);

    expect(configService.get('config.port')).toBeTruthy();
    expect(configService.get('config.project')).toBeTruthy();
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
    expect(ConfigService.root()).toEqual(expectedAppRootPath);
  });

  it('Will Setup Modules with its Components', async () => {
    @Injectable()
    class ComponentTest {
      constructor(
        @InjectConfig('config')
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

    expect(componentTest.testConfig()).toEqual({
      port: 2000,
      project: 'nest-config',
    });
    expect(componentTest.testConfig()).toBeInstanceOf(Config);
  });

  it('Multiple ConfigParam decorators', async () => {
    @Injectable()
    class ComponentTest {
      constructor(
        @InjectConfig('config')
        private readonly server?: { port: number },
        @InjectConfig('config') private readonly stub?: { port: number },
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

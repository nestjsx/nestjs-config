import 'reflect-metadata';
import { DynamicModule, Module, Global } from '@nestjs/common';
import {
  Module as NestModule,
  ComponentMetatype,
} from '@nestjs/core/injector/module';
import { ConfigService } from './config.service';
import { DotenvOptions } from 'dotenv';
import { MetadataScanner } from '@nestjs/core/metadata-scanner';
import { ModulesContainer } from '@nestjs/core/injector';
import { CONFIG_CONFIGURABLE, CONFIG_PARAM, CONFIG_PARAMS } from '../constants';
import { metadata as NEST_METADATA_CONSTANTS } from '@nestjs/common/constants';
import { Injectable } from '@nestjs/common/interfaces';
import { inspect } from 'util';
import { applyParamsMetadataDecorator } from '../utils';

@Global()
@Module({})
export class ConfigModule {
  /**
   * From Glob
   * @param glob
   * @param {DotenvOptions} options
   * @returns {DynamicModule}
   */
  static load(glob?: string, options?: DotenvOptions): DynamicModule {
    const configProvider = {
      provide: ConfigService,
      useFactory: async (moduleContainer: ModulesContainer): Promise<any> => {
        const modules = [...moduleContainer.values()];
        ConfigModule.setupModules(modules);
        return ConfigService.load(glob, options);
      },
      inject: [ModulesContainer],
    };
    return {
      module: ConfigModule,
      providers: [configProvider],
      exports: [configProvider],
    };
  }

  static setupModules(modules: NestModule[]) {
    modules.forEach(({ metatype }) => {
      const metadata: ComponentMetatype[] =
        Reflect.getMetadata(NEST_METADATA_CONSTANTS.PROVIDERS, metatype) || [];
      console.log({ metadata });
      const components = [
        ...metadata.filter(metatype => typeof metatype === 'function'),
      ];
      ConfigModule.setupComponents(components);
    });
  }

  static setupComponents(components: ComponentMetatype[]) {
    const metadataScanner = new MetadataScanner();
    console.log({ components });
    components.map(component => {
      const componentPrototype = component['prototype'];
      const reflectMetadata = metadataScanner.scanFromPrototype<
        Injectable,
        any
      >(null, componentPrototype, method => {
        const descriptor = Reflect.getOwnPropertyDescriptor(
          componentPrototype,
          method,
        );
        const metadata = Reflect.getMetadata(
          CONFIG_CONFIGURABLE,
          descriptor.value,
        );
        console.warn({
          component: componentPrototype,
          descriptor: descriptor.value,
        });
        const keys = Reflect.getMetadataKeys(descriptor.value);
        console.log(
          inspect(
            {
              method: componentPrototype[method],
              methodName: method,
              metadata,
              descriptor,
              keys,
              param: descriptor.value,
            },
            true,
            8,
            true,
          ),
        );
      });
    });
  }
}

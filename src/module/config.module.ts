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
import { CONFIG_CONFIGURABLE } from '../constants';
import { metadata as NEST_METADATA_CONSTANTS } from '@nestjs/common/constants';
import { Injectable } from '@nestjs/common/interfaces';

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

  /**
   * 
   * @param modules 
   */
  static setupModules(modules: NestModule[]) {
    modules.forEach(({ metatype }) => {
      const metadata: ComponentMetatype[] =
        Reflect.getMetadata(NEST_METADATA_CONSTANTS.PROVIDERS, metatype) || [];

      const components = [
        ...metadata.filter(metatype => typeof metatype === 'function'),
      ];
      ConfigModule.setupProviders(components);
    });
  }

  /**
   * 
   * @param components 
   */
  static setupProviders(components: ComponentMetatype[]) {
    const metadataScanner = new MetadataScanner();

    components.map(component => {
      const providerPrototype = component['prototype'];
      const reflectMetadata = metadataScanner.scanFromPrototype<
        Injectable,
        any
      >(null, providerPrototype, method => {
        const descriptor = Reflect.getOwnPropertyDescriptor(
          providerPrototype,
          method,
        );
        
        Reflect.getMetadata(
          CONFIG_CONFIGURABLE,
          descriptor.value,
        );
        
        Reflect.getMetadataKeys(descriptor.value);
        
      });
    });
  }
}

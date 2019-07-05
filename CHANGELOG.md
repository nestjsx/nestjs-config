# [2.0.0-beta](https://github.com/nestjsx/nestjs-config/compare/1.4.0...next)

 Configs are no longer stored as an object on a static `ConfigService` provider. References are stored in order to 'fetch' injectables from the container. The aim is to improve the ConfigModule's usability in Module configuring by making the ConfigModule more asynchronous and able to create injectable providers dynamically. 

 More details of the reasons why for this change can be found [here](https://github.com/nestjsx/nestjs-config/issues/54).

### Features

 - Defining tokens/config names 
 - Dependancy injection of classes 
 - forRootAsync method was implemented
 - ForRoot method was added for sync method
 - Non-class config files are injected into `Config` class 'wrapper' by default for `Config.get` on the injectable

### BREAKING CHANGES

 - `ConfigModule.resolveSrcPath` was removed (replaced with `resolveRootPath`)
 - `ConfigService.src` was removed (replaced with `root`)
 - `ConfigService.merge` and `ConfigService.mergeSync` were removed
 - `modifyConfigName` option was removed in favour of [defined provider and name options within config file definition](https://github.com/nestjsx/nestjs-config/tree/next#defined-config-provider-tokenname) or [class](https://github.com/nestjsx/nestjs-config/tree/next#config-object)
 - `ConfigModule.load` was replaced with `forRootAsync`
 - `@ConfigParam` and `@Configurable` decorator pair were removed
 - `ConfigService.get` and `ConfigServie.has` can no longer handle an array of strings. This is to favour the method of fetching tokenised configs 
 - `ConfigService.set` was removed
 - `ConfigService.registerHelper` was removed in favour of custom classes
 - `ConfigService.loadSync` was removed in favour of `mode` parameter
 - `@InjectConfig` now injects a config token provider and not the config service. `ConfigService` injection has been changed to `@InjectConfigService`
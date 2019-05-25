<p align="center"><img src="https://avatars1.githubusercontent.com/u/41109786?s=200&v=4"/></p>
<p align="center">
    <a href="https://travis-ci.org/nestjsx/nestjs-config"><img src="https://travis-ci.org/nestjsx/nestjs-config.svg?branch=master"/></a>
    <a href="https://www.npmjs.com/package/nestjs-config"><img src="https://img.shields.io/npm/v/nestjs-config.svg"/></a>
    <a href="https://github.com/nestjsx/nestjs-config/blob/master/LICENSE"><img src="https://img.shields.io/github/license/nestjsx/nestjs-config.svg"/></a>
    <a href="https://coveralls.io/github/nestjsx/nestjs-config?branch=master"><img src="https://coveralls.io/repos/github/nestjsx/nestjs-config/badge.svg?branch=master"/></a>
    <a href="https://npm.packagequality.com/#?package=nestjs-config"><img src="https://npm.packagequality.com/shield/nestjs-config.svg"/></a>
    <img src="https://flat.badgen.net/dependabot/nestjsx/nestjs-config?icon=dependabot" />
    <img src="https://camo.githubusercontent.com/a34cfbf37ba6848362bf2bee0f3915c2e38b1cc1/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f5052732d77656c636f6d652d627269676874677265656e2e7376673f7374796c653d666c61742d737175617265" />
    <a href="https://github.com/juliandavidmr/awesome-nestjs#components--libraries"><img src="https://raw.githubusercontent.com/nestjsx/crud/master/img/awesome-nest.svg?sanitize=true" alt="Awesome Nest" /></a>
    <a href="https://github.com/nestjs/nest"><img src="https://raw.githubusercontent.com/nestjsx/crud/master/img/nest-powered.svg?sanitize=true" alt="Nest Powered" /></a>

</p>
<h1 align="center">Nestjs Config</h1>

<p align="center">Configuration component for NestJs.</p>


## Features

- Load your configuration files using globs
- Support for different environment configurations, thanks to [dotenv](https://github.com/motdotla/dotenv)
- Change and Load configuration at runtime

### Installation

**Yarn**
```bash
yarn add nestjs-config@2.0.0-beta
```

**NPM**
```bash
npm install nestjs-config --save
```

### Getting Started

Let's imagine that we have a folder called `src/config` in our project that contains several configuration files.

```bash
/src
├── app.module.ts
├── config
│   ├── express.ts
│   ├── graphql.ts
│   └── grpc.ts
```

Let's register the config module in `app.module.ts`

```ts
import { Module } from '@nestjs/common';
import { ConfigModule } from 'nestjs-config';
import * as path from 'path';

@Module({
    imports: [
        ConfigModule.forRootAsync(path.resolve(__dirname, 'config', '**/!(*.d).{ts,js}')),
    ],
})
export class AppModule {}
```
That's it!

-----

#### Complex Project Structure

Now let's say that your application isn't located in a folder called `src`, but it's located in `src/app`.

We want to be able to set a different 'root path' to load our configurations from. Be it `src` or `dist`.

Imagine a more complex project structure like this:

```
/
├── dist/
├── src/
│   ├── app/
│   │   ├── app.module.ts
│   │   └── bootstrap/
│   │   │   ├── index.ts
│   │   │   └── bootstrap.module.ts
│   ├── migrations/
│   ├── cli/
│   ├── config/
│   │   ├── app.ts
│   │   └── database.ts
│   └── main.ts
├── tsconfig.json
└── package.json
```

In this example, config files are located in the `/src/config` folder, because they are shared 
between app, migrations and cli scripts. 

Also during typescript compilation all files from `src/` folder will be moved to the `dist/` folder. 

Moreover, the `ConfigModule` is imported in the `BootstrapModule`, but not directly in `AppModule`.

```ts
// app.module.ts
import { Module } from '@nestjs/common';
import { BootstrapModule } from './bootstrap';
import { ConfigService } from 'nestjs-config';

ConfigService.rootPath = path.resolve(__dirname, '..');

@Module({
    imports: [BootstrapModule],
})
export class AppModule {}
```

```typescript
// bootstrap.module.ts
import * as path from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule } from 'nestjs-config';

@Module({
    imports: [
      ConfigModule.forRootAsync(path.resolve('config', '**/!(*.d).{ts,js}')),
    ],
})
export class BootstrapModule {}
```
Setting the `ConfigService.rootPath` before calling `ConfigModule.forRootAsync(...)` will change the default root dir of where your configs are loaded from.

Another method is to invoke `ConfigModule.resolveRootPath(__dirname)` from any module before loading the config and use glob with a relative path.
  ```ts
  // bootstrap.module.ts
  import { Module } from '@nestjs/common';
  import { ConfigModule } from 'nestjs-config';
  
  @Module({
      imports: [
        ConfigModule.resolveRootPath(__dirname).forRootAsync('config/**/!(*.d).{ts,js}')
      ],
  })
  export class BootstrapModule {}
  ```

In both cases we provide the glob of our configuration as first argument, but it is relative to the `src/` folder (or eventually `dist/`).

## Multi-modular config usage

In some cases your structure might take on this shape

```
/
├── src/
│   ├── cats/
│   │   ├── cats.module.ts
│   │   └── cats.config.ts
│   ├── dogs/
│   │   ├── dogs.module.ts
│   │   └── dogs.config.ts
│   ├── app.module.ts
│   └── main.ts
├── tsconfig.json
└── package.json
```

With the examples above you'd have to call your config like so `ConfigService.get('dogs.config.bark')`. You can use the `modifyConfigName` method option to change the name of your configs 

```ts
import { Module } from '@nestjs/common';
import { ConfigModule } from 'nestjs-config';
import * as path from 'path';

@Module({
    imports: [
        ConfigModule.forRootAsync(path.resolve(__dirname, '**/!(*.d).config.{ts,js}'), {
            modifyConfigName: name => name.replace('.config', ''),
        }),
    ],
})
export class AppModule {}
```
Now you can call your config like so `ConfigService.get('dogs.bark')`.

## Production environments

You might have notice the use of `config/**/!(*.d).{ts,js}` in the glob. When running in production (running in JavaScript after TypeScript compilation) we want to disinclude the TypeScript definition files. The use of `config/**/*.ts` is fine in dev environments but we recommend using this example `config/**/!(*.d).{ts,js}` to avoid issues later on when running in a production environment.

## Environment Configuration

This package ship with the amazing [dotenv](https://github.com/motdotla/dotenv) package that allows you to create
a `.env` file in your preferred location.

Let's create one, for demo purposes!

```bash
# .env
EXPRESS_PORT=3000
```

Now, in our `src/config/express.ts` configuration file, we can refer to that environment variable 

```ts
// src/config/express.ts
export default {
    port: process.env.EXPRESS_PORT || 3000,
}
```

> **Note:** By default the package look for a `.env` file in the path that you have started your server from.
If you want to specify another path for your `.env` file, use the second parameter of `ConfigModule.forRootAsync()`.


### Usage

Now we are ready to inject our `ConfigService` anywhere we'd like.

```ts
import {ConfigService} from 'nestjs-config';

@Injectable()
class SomeService {

    constructor(private readonly config: ConfigService) {
        this.config = config;
    }
    
    isProduction() {
        const env = this.config.get('app.environment');
        
        return env === 'production';
    }
}
```

You may also use the `@InjectConfig` decorator as following:

```ts
import {InjectConfig} from 'nestjs-config';

@Injectable()
class SomeService {

    constructor(@InjectConfig() private readonly config) {
        this.config = config;
    }
}
```

## Custom Helpers
This feature allows you to create small helper function that computes values from your configurations.

Reconsider the `isProduction()` method from above. But in this case, let's define it as a helper:

```ts
// src/config/express.ts

export default {

    environment: process.env.EXPRESS_ENVIRONMENT,
    port: process.env.EXPRESS_PORT,
    
    // helpers
    isProduction() {
        return this.get('express.environment') === 'production';
    }
}
```

You can use the helper function as follows:

```ts
// this.config is the ConfigService!
this.config.get('express').isProduction();

// or
this.config._isProduction(); // note the underscore prefix.
```

#### Global Helpers

You can also attach helpers to the global instance as follow:

```ts
this.config.registerHelper('isProduction', () => {
    return this.get('express.environment') === 'production';
});
```

And then use it like this:

```ts
this.config.isProduction(); // note the missing underscore prefix
```

## Decorators 

It's possible to use decorators instead of injecting the `ConfigService`. 
Note that the `@Configurable()` decorator replaces the `descriptor.value` for the
method with its own function. Regarding to the current nestjs implementation
([Issue-1180](https://github.com/nestjs/nest/issues/1180)), this behavior will 
break all decorators that **FOLLOW AFTER** the `@Configurable()` decorator.

For the expected behavior, the `@Configurable()` decorator **MUST** be placed at 
the last position for one method.

**Working Example:**
```ts
import {Injectable, Get} from '@nestjs/common';
import {Configurable, ConfigParam} from 'nestjs-config';

@Injectable()
export default class UserController {
    
    @Get('/')
    @Configurable()
    index(@ConfigParam('my.parameter', 'default value') parameter?: string) {
        return { data: parameter };
    }
}
```

**Broken Example:**
```ts
import {Injectable, Get, UseInterceptors} from '@nestjs/common';
import {Configurable, ConfigParam} from 'nestjs-config';
import {TransformInterceptor} from '../interceptors';

@Injectable()
export default class UserController {
    
    @Configurable()
    @Get('/')   // <-- nestjs decorator won't work because it placed after @Configurable()
    @UseInterceptors(TransformInterceptor)// <-- nestjs decorator won't work because it placed after @Configurable()
    index(@ConfigParam('my.parameter', 'default value') parameter?: string) {
        return { data: parameter };
    }
}
```

**Broken Example 2:**
```ts
import {Injectable, Get, UseInterceptors} from '@nestjs/common';
import {Configurable, ConfigParam} from 'nestjs-config';
import {TransformInterceptor} from '../interceptors';

@Injectable()
export default class UserController {
    
    
    @Get('/') // <-- nestjs decorator will work fine because it placed before @Configurable()
    @Configurable()
    @UseInterceptors(TransformInterceptor) // <-- nestjs decorator won't work because it placed after @Configurable()
    index(@ConfigParam('my.parameter', 'default value') parameter?: string) {
        return { data: parameter };
    }
}
```

## TypeORM 

Using the `ConfigModule` in combination with [TypeORM](https://github.com/typeorm/typeorm) (e.g. in order to configure TypeORM) requires using the `forRootAsync()` function supplied by the typeorm package for nestjs (`@nestjs/typeorm`)

```ts
import {Module} from '@nestjs/common';
import {ConfigModule, ConfigService} from 'nestjs-config';
import {TypeOrmModule} from '@nestjs/typeorm';
import * as path from 'path';

@Module({
    imports: [
        ConfigModule.forRootAsync(path.resolve(__dirname, 'config', '**', '!(*.d).{ts,js}')),
        TypeOrmModule.forRootAsync({
            useFactory: (config: ConfigService) => config.get('database'),
            inject: [ConfigService],
        }),
    ],
})
export default class AppModule {}
```

Your config file may look something like this: 

```ts
//config/database.ts
export default {
    type: 'mysql',
    host: process.env.TYPEORM_HOST,
    username: process.env.TYPEORM_USERNAME,
    password: process.env.TYPEORM_PASSWORD,
    database: process.env.TYPEORM_DATABASE,
    port: parseInt(process.env.TYPEORM_PORT),
    logging: process.env.TYPEORM_LOGGING === 'true',
    entities: process.env.TYPEORM_ENTITIES.split(','),
    migrationsRun: process.env.TYPEORM_MIGRATIONS_RUN === 'true',
    synchronize: process.env.TYPEORM_SYNCHRONIZE === 'true',
};
```

> We recommend using a `TYPEORM_` prefix so when running in production environments you're also able to use the same envs for runnning the typeorm cli. [More options here](http://typeorm.io/#/using-ormconfig/using-environment-variables)


## Custom env file path

To use dotenv options, you will need to install `@types/dotenv` by running

```bash
$ yarn add --dev @types/dotenv
```

Now you can specify dotenv options with the second parameter of the load method

```ts
ConfigModule.load(path.resolve(__dirname, '*/**!(*.d).config.{ts,js}'), {
    path: path.resolve(__dirname, '..', '.env.staging')),
});
```

## TypeORM config with types! 

```ts
//config.database
export class DatabaseConfig {
    type: 'mysql' | 'postgres' = 'mysql';
    host: string = process.env.TYPEORM_HOST;
    username: string = process.env.TYPEORM_USERNAME;
    password: string = process.env.TYPEORM_PASSWORD;
    name: string = process.env.TYPEORM_DATABASE;
    port: number = parseInt(process.env.TYPEORM_PORT);
    logging: boolean = process.env.TYPEORM_LOGGING === 'true' || process.env.TYPEORM_LOGGING === 1;
    entitites: string[] = process.env.TYPEORM_ENTITIES.split(',');
    migrationsRun: boolean = process.env.TYPEORM_MIGRATIONS_RUN === 'true';
    synchronize: boolean = false;
}

```

```ts
import {Module} from '@nestjs/common';
import {ConfigModule, ConfigService} from 'nestjs-config';
import {TypeOrmModule} from '@nestjs/typeorm';
import {DatabaseConfig} from './config/database';
import * as path from 'path';

@Module({
    imports: [
        ConfigModule.forRootAsync(path.resolve(__dirname, 'config', '**', '!(*.d).{ts,js}')),
        TypeOrmModule.forRootAsync({
            useFactory: (config: DatabaseConfig) => config,
            inject: [DatabaseConfig],
        }),
    ],
})
export default class AppModule {}
```

## ConfigService API

#### get(param: string | string[], value: any = undefined): any
Get a configuration value via path, you can use `dot notation` to traverse nested object. It returns a default value if the key does not exist.

```ts
this.config.get('server.port'); // 3000
this.config.get('an.undefined.value', 'foobar'); // 'foobar' is returned if the key does not exist
```

#### has(param: string | string[]): boolean
Determine if the given path for a configuration exists and is set.

```ts
this.config.has('server.port'); // true or false
```

#### resolveRootPath(path: string): typeof ConfigService
change the root path from where configs files are loaded

```ts
import { Module } from '@nestjs/common';
import { ConfigModule } from 'nestjs-config';

@Module({
    imports: [
        ConfigModule.resolveRootPath(__dirname).forRootAsync(path.resolve(__dirname, '**/!(*.d).{ts,js}')),
    ],
})
export class AppModule {}
```

#### root(path: string = ''): string

Returns the current working dir or defined rootPath. 

```ts
ConfigService.root(); // /var/www/src
ConfigService.root('some/path/file.html'); // /var/www/src/some/path/file.html

ConfigService.resolveRootPath(__dirname).root(); // /var/www/src/app (or wherever resolveRootPath has been called with)
```

-----

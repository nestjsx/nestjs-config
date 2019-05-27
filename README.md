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
- DI your configurations
- Customisable config tokens

### Installation

**Yarn**

```bash
yarn add nestjs-config@^2.0.0-beta
```

**NPM**

```bash
npm install nestjs-config@^2.0.0-beta --save
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
    ConfigModule.forRootAsync(
      path.resolve(__dirname, 'config', '**/!(*.d).{ts,js}'),
    ),
  ],
})
export class AppModule {}
```

That's it!

---

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
    ConfigModule.resolveRootPath(__dirname).forRootAsync(
      'config/**/!(*.d).{ts,js}',
    ),
  ],
})
export class BootstrapModule {}
```

In both cases we provide the glob of our configuration as first argument, but it is relative to the `src/` folder (or eventually `dist/`).

## DI configs

Dependancy Injection for your configs.

```ts
import { Config } from 'nestjs-config';

export default class SomeClass extends Config {
  someProperty: process.env.SOME_ENV;
}
```

This feature was added mainly for use with other forRootAsync modules and to remove the need of injecting the ConfigService everywhere.

```ts
@Module({
  imports: [
    ConfigModule.forRootAsync(path.resolve('config/**/!(*.d).{ts,js}')),
    TypeOrmModule.forRootAsync({
      injects: [DatabaseConfig],
      useFactory: (config: DatabaseConfig) => config,
    }),
    AmqpModule.forRootAsync({
      injects: [AmqpConfig],
      useFactory: (config: AmqpConfig) => config,
    }),
  ],
})
export class SomeModule {}
```

### Drawback!

The only drawback of using the DI structure is that the configs themselves are build dynamically meaning they don't exist before the ConfigModule has built them. Therefore they're only available for async providers etc.

```ts
@Injectable()
class SomeProvider {
  constructor(private readonly config: SomeClass) {}
}

@Module({
  imports: [
    ConfigModule.forRootAsync(path.resolve('config/**/!(*.d).{ts,js}')),
  ],
  providers: [
    SomeClass, // Will fail
    {
      useFactory: (config: SomeClass) => new SomeProvider(config), // Will work!
      injects: [SomeClass],
    },
  ],
})
export class SomeModule {}
```

## Config Object

By default config files are now converted into a Config object which is esentailly a stripped version of the ConfigService. The idea is you can pass and amend any structure and keep the `get` method to use lodash.get for patterns and the default value.

```ts
// config/some.ts
export default {
  value: {
    in: {
      pattern: false,
    },
  },
};

// some.module
@Module({
  imports: [
    ConfigModule.forRootAsync(path.resolve('config/**/!(*.d).{ts,js}')),
  ],
  providers: [
    {
      useFactory: (config: SomeClass) =>
        new SomeProvider(config.get('some.value.in.pattern', 'default')),
      injects: [SomeClass],
    },
  ],
})
export class SomeModule {}
```

It's also possible to extend the Config class from your config file and define your own methods!

```ts
// config/anything.you.like.ts
export default class MyConfig extends Config {
  value: {
    in: {
      pattern: false,
    },
  },

  getPattern(): boolean {
    return this.value.in.pattern;
  }
};

// some.module
@Module({
  imports: [
    ConfigModule.forRootAsync(path.resolve('config/**/!(*.d).{ts,js}')),
  ],
  providers: [
    {
      useFactory: (config: MyConfig) => new SomeProvider(config.getPattern()),
      injects: [MyConfig],
    },
  ],
})
export class SomeModule {}
```

## Defined config provider token/name

It's possible to change the provider token and pattern prefix. By default the file name will be used as like v1. With v2 it's possible to define your `__provide` and `__name` properties on the object like so.

```ts
export default {
  __provide: 'my_token',
  __name: 'my_name',
};
```

If you define just `__provide` it will be used for both token and pattern prefix. Defining just `__name` will also be used for both token and pattern prefix. Defining both means `__provide` will be your token and `__name` will be your pattern prefix.

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

With the examples above you'd have to call your config like so `ConfigService.get('dogs.config.bark')`. You can use the `__provide` method option to change the token of your configs

```ts
//config/dogs.config.ts
export default {
  __provide: 'dogs',
  bark: 'woof',
};

//app.module
import { Module } from '@nestjs/common';
import { ConfigModule } from 'nestjs-config';
import * as path from 'path';

@Module({
  imports: [
    ConfigModule.forRootAsync(
      path.resolve(__dirname, '**/!(*.d).config.{ts,js}'),
    ),
  ],
})
export class AppModule {}
```

Now you can call your config like so `ConfigService.get('dogs.bark')`.

## Production environments

You might have notice the use of `config/**/!(*.d).{ts,js}` in the glob. When running in production (running in JavaScript after TypeScript compilation) we want to disinclude the TypeScript definition files. The use of `config/**/*.ts` is fine in dev environments but we recommend using this example `config/**/!(*.d).{ts,js}` to avoid issues later on when running in a production environment.

## Environment Configuration

This package ships with the amazing [dotenv](https://github.com/motdotla/dotenv) package that allows you to create
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
};
```

> **Note:** By default the package will look for a `.env` file in the path that you have started your server from.
> If you want to specify another path for your `.env` file, use the second parameter of `forRootAsync`.

### Usage

Now we are ready to inject our `ConfigService` anywhere we'd like.

```ts
import { ConfigService } from 'nestjs-config';

@Injectable()
class SomeService {
  constructor(private readonly config: ConfigService) {}

  isProduction() {
    const env = this.config.get('app.environment');

    return env === 'production';
  }
}
```

You may also use the `@InjectConfig` decorator as following:

```ts
import { InjectConfig } from 'nestjs-config';

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
  },
};
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

As of version 2, decorator support for parameter injection has been removed as they weren't great.

## TypeORM

Using the `ConfigModule` in combination with [TypeORM](https://github.com/typeorm/typeorm) (e.g. in order to configure TypeORM) requires using the `forRootAsync()` function supplied by the typeorm package for nestjs (`@nestjs/typeorm`)

```ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from 'nestjs-config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as path from 'path';

@Module({
  imports: [
    ConfigModule.forRootAsync(
      path.resolve(__dirname, 'config', '**', '!(*.d).{ts,js}'),
    ),
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

## TypeORM config with DI + types

```ts
//config.database
export class DatabaseConfig {
  type: 'mysql' | 'postgres' = 'mysql';
  host: string = process.env.TYPEORM_HOST;
  username: string = process.env.TYPEORM_USERNAME;
  password: string = process.env.TYPEORM_PASSWORD;
  name: string = process.env.TYPEORM_DATABASE;
  port: number = parseInt(process.env.TYPEORM_PORT);
  logging: boolean =
    process.env.TYPEORM_LOGGING === 'true' || process.env.TYPEORM_LOGGING === 1;
  entitites: string[] = process.env.TYPEORM_ENTITIES.split(',');
  migrationsRun: boolean = process.env.TYPEORM_MIGRATIONS_RUN === 'true';
  synchronize: boolean = false;
}
```

```ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from 'nestjs-config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConfig } from './config/database';
import * as path from 'path';

@Module({
  imports: [
    ConfigModule.forRootAsync(
      path.resolve(__dirname, 'config', '**', '!(*.d).{ts,js}'),
    ),
    TypeOrmModule.forRootAsync({
      useFactory: (config: DatabaseConfig) => config,
      inject: [DatabaseConfig],
    }),
  ],
})
export default class AppModule {}
```

## ConfigService API

#### get<T>(param: string, value: any = undefined): T

Get a configuration value via path, you can use `dot notation` to traverse nested object. It returns a default value if the key does not exist.

```ts
this.configService.get('server.port'); // 3000 where file server exists with export property {port: 3000}
this.configService.get('an.undefined.value', 'foobar'); // 'foobar' is returned if the key does not exist
```

#### has(name: string): boolean

Determine if the given token name reference exists in the ConfigService

```ts
this.configService.has('some_string'); // true or false
this.configService.has(SomeClass);
```

#### resolveRootPath(path: string): typeof ConfigService

change the root path from where configs files are loaded

```ts
import { Module } from '@nestjs/common';
import { ConfigModule } from 'nestjs-config';

@Module({
  imports: [
    ConfigModule.resolveRootPath(__dirname).forRootAsync(
      path.resolve(__dirname, '**/!(*.d).{ts,js}'),
    ),
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

## Config API

### get<T>(param: string, value: any = undefined): T

Finds a property on itself with a pattern

```ts
const config = new Config({
  test: {
    example: 123,
  },
});

config.get<number>('test.example'); // 123
```


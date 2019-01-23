<p align="center"><img src="https://avatars1.githubusercontent.com/u/41109786?s=200&v=4"/></p>
<p align="center">
    <a href="https://travis-ci.org/nestjs-community/nestjs-config"><img src="https://travis-ci.org/nestjs-community/nestjs-config.svg?branch=master"/></a>
    <a href="https://www.npmjs.com/package/nestjs-config"><img src="https://img.shields.io/npm/v/nestjs-config.svg"/></a>
    <a href="https://github.com/nestjs-community/nestjs-config/blob/master/LICENSE"><img src="https://img.shields.io/github/license/nestjs-community/nestjs-config.svg"/></a>
    <a href="https://coveralls.io/github/nestjs-community/nestjs-config?branch=master"><img src="https://coveralls.io/repos/github/nestjs-community/nestjs-config/badge.svg?branch=master"/></a>
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
yarn add nestjs-config
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
import { ConfigModule } from "nestjs-config";
import * as path from 'path';

@Module({
    imports: [
        ConfigModule.load(path.resolve(__dirname, 'config', '**/(!*.d).{ts,js}')),
    ],
})
export class AppModule {}
```
That's it!

-----

#### Complex Project Structure

Now let's say that your application isn't located in a folder called `src`, but it's located in `./app`.

We provide as first argument the glob of our interested configuration that we want to load.

Imagine a more complex project structure:

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
import { BootstrapModule } from "./bootstrap";

ConfigService.srcPath = path.resolve(__dirname, '..');

@Module({
    imports: [BootstrapModule],
})
export class AppModule {}
```

```typescript
// bootstrap.module.ts
import * as path from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule } from "nestjs-config";

@Module({
    imports: [
      ConfigModule.load(path.resolve('config', '**/(!*.d).{ts,js}')),
    ],
})
export class BootstrapModule {}
```
Setting the `ConfigService.srcPath` before calling `ConfigModule.load(...)` will change the default root dir of where your configs are loaded from.

Another method is to invoke `ConfigModule.resolveSrcPath(__dirname)` from any module before loading the config and use glob with a relative path.
  ```ts
  // bootstrap.module.ts
  import { Module } from '@nestjs/common';
  import { ConfigModule } from "nestjs-config";
  
  @Module({
      imports: [
        ConfigModule.resolveSrcPath(__dirname).load('config/**/(!*.d).{ts,js}')
      ],
  })
  export class BootstrapModule {}
  ```

In both cases we provide the glob of our configuration as first argument, but it is relative to the `src/` folder.

### Environment Configuration

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
If you want to specify another path for your `.env` file, use the second parameter of `ConfigModule.load()`.


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

### Customer Helpers
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
    
    @Get("/")
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
    @Get("/")   // <-- nestjs decorator won't work because it placed after @Configurable()
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
    
    
    @Get("/") // <-- nestjs decorator will work fine because it placed before @Configurable()
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
        ConfigModule.load(path.resolve(__dirname, 'config', '**', '(!*.d).{ts,js}')),
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
    host: process.env.DB_HOST,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT),
};
```

## ConfigService API

#### get(param: string | string[], value: any = undefined): any
Get a configuration value via path, you can use `dot notation` to traverse nested object. It returns a default value if the key does not exist.

```ts
this.config.get('server.port'); // 3000
this.config.get('an.undefined.value', 'foobar'); // 'foobar' is returned if the key does not exist
```

#### set(param: string | string[], value: any = null): Config
Set a value at runtime, it creates the specified key / value if it doesn't already exists.

```ts
this.config.set('server.port', 2000); // {server:{ port: 2000 }}
```

#### has(param: string | string[]): boolean
Determine if the given path for a configuration exists and is set.

```ts
this.config.has('server.port'); // true or false
```

#### merge(glob: string, options?: DotenvOptions): Promise<void>
Load other configuration files at runtime. This is great for package development.

```ts
@Module({})
export class PackageModule implements NestModule {

    constructor(@InjectConfig() private readonly config) {}

    async configure(consumer: MiddlewareConsumer) {
        await this.config.merge(path.resolve(__dirname, '**/(!.*).config.{ts,js}'));
    }
}
```

#### registerHelper(name: string, fn: (...args:any[]) => any): ConfigService
Register a custom global helper function

```ts
this.config.registerHelper('isProduction', () => {
    return this.get('express.environment') === 'production';
});
```

-----

Built by Fenos, Shekohex and Bashleigh

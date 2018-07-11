# NestJS Config

Configuration component for NestJs.


[![Build Status](https://travis-ci.org/bashleigh/nestjs-config.svg?branch=master)](https://travis-ci.org/bashleigh/nestjs-config)
[![GitHub version](https://img.shields.io/npm/v/nestjs-config.svg)](https://www.npmjs.com/package/nestjs-config)
[![GitHub license](https://img.shields.io/github/license/bashleigh/nestjs-config.svg)](https://github.com/bashleigh/nestjs-config/blob/master/LICENSE)
[![Coverage Status](https://coveralls.io/repos/github/bashleigh/nestjs-config/badge.svg?branch=master)](https://coveralls.io/github/bashleigh/nestjs-config?branch=master)

## Features

- Load your configurations with globs
- Support for different environment configuration, thanks to [dotenv](https://github.com/motdotla/dotenv)
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

Let's imagine that we have a folder called `config` in our project under `src`

```bash

/src
├── app.module.ts
├── config
│   ├── express.ts
│   ├── graphql.ts
│   └── grpc.ts
```

Let's register the config module in `app.module.ts`

```ts
import * as path from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule } from "nestjs-config";

@Module({
    imports: [
        ConfigModule.load(),
    ],
})
export class AppModule {

}
```
We provide as first argument the glob of our interested configuration that we want to load.

That's it!

Now let's say that your application isn't in a folder called `src`, it's in `./app`.

```ts
import * as path from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule } from "nestjs-config";

@Module({
    imports: [
        ConfigModule.load(
            path.resolve(__dirname, 'config/**/*.{ts,js}')
        ),
    ],
})
export class AppModule {

}
```

### Environment configuration

This package ship with the amazing [dotenv](https://github.com/motdotla/dotenv) so that you can create
a `.env` file in your preferred location.

let's create one!

```bash
# app/.env

EXPRESS_PORT=3000
```

now in our `app/config/epxress.ts` file we can refer to that environment variable 

```ts
// app/config/express.ts


export default {

    port: process.env.EXPRESS_PORT
}
```

**Note:** By default the package look for a `.env` file in the path that you started your server from.
If you want to specify a path for your `.env` file use the second parameter of `ConfigModule.load`.


### Usage

Now we are ready to inject our `ConfigService` everywhere we'd like.

```ts
import {ConfigService} from 'nestjs-config'


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

You can also use the `@InjectConfig` decorator instead, as following:

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
This feature allows you to create small helper function that computes values from configurations.

example `isProduction` helper:

```ts
// app/config/express.ts


export default {

    environment: process.env.EXPRESS_PORT
    port: process.env.EXPRESS_PORT,
    
    // helpers
    isProduction() {
        return this.get('express.environment') === 'production';
    }
}
```

usage:

```ts
this.config.get('express').isProduction();

// or

this.config._isProduction(); // note the underscore prefix.
```

**Global Helpers**

You can also attach helpers to the global instance as follow:

```ts

this.config.registerHelper('isProduction', () => {
    return this.get('express.environment') === 'production';
});
```

Then use it:

```ts
this.config.isProduction();
```

### ConfigService API

#### get(param: string | string[], value: any = undefined): any
Get a configuration value via path, you can use `dot notation` to traverse nested object.

```ts
this.config.get('server.port'); // 3000
```

#### set(param: string | string[], value: any = null): Config
Set a value at runtime, it creates one if doesn't exists.

```ts
this.config.set('server.port', 2000); // {server:{ port: 2000 }}
```

#### has(param: string | string[]): boolean
Determine if the given path for a configuration exists and set

```ts
this.config.has('server.port'); // true or false
```

#### merge(glob: string, options?: DotenvOptions): Promise<void>
You can load other configuration at runtime. Great for package development.


```ts
@Module({})
export class PackageModule implements NestModule {

    constructor(@InjectConfig() private readonly config) {}

    configure(consumer: MiddlewareConsumer) {
        this.config.merge(path.join(__dirname, '**/*.config.{ts,js}');
    }
}
```


#### registerHelper(name: string, fn: (...args:any[]) => any): ConfigService
Register custom global helper


```ts
this.config.registerHelper('isProduction', () => {
    return this.get('express.environment') === 'production';
});

Built from Fenos and Bashleigh

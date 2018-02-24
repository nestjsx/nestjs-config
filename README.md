Nest Config
===

A config component for nestJS.

## Install

```bash
yarn add @bashleigh/nest-config
```

```bash
npx add --save @bashleigh/nest-config
```

create a `.env` file and insert your configurations

```bash
touch .env && echo 'APP_TEST=true' > .env
```

## How to use

### Get

Get a parameter from the config

```typescript
const test = this.config.get('APP_TEST');
```
With a default option

```typescript
const test = this.config.get('APP_TEST', false);
```

### Has

Check your config has a parameter defined

```typescript
this.config.has('APP_TEST');
```


## Integrating with modules

```typescript
import {
    Module,
} from '@nestjs/common';

import {
    ConfigService,
} from '@bashleigh/nest-config';

@Module({
  imports: [],
  controllers: [],
  components: [
    ConfigService,
  ],
})
export class ApplicationModule {
  constructor() {}
}

```

### Injection

Inject the component into a controller 

```typescript

import {
    Controller,
} from '@nestjs/common';

import {
    ConfigService,
} from '@bashleigh/nest-config';

@Controller('user')
export default class UserController {
    constructor(private readonly config: ConfigService) {}
    
}

```

## Known issue

I'm not 100% up to speed with either TypeScript nor nestJS. This package isn't particularly great since I'm not aware of a singular sharing method between Modules.  
It appears components are only relative to their modules and therefore using this service in more than one place will result in loading the the `.env` file several times.
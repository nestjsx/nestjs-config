Nest Config
===

A config component for nestJS.

## Install

A dotenv config module to your application

```typescript
import {
    Module,
} from '@nestjs/common';

import ConfigModule from '@bashleigh/nest-config';

@Module({
  imports: [
    ConfigModule,
  ],
  controllers: [],
  components: [],
})
export class ApplicationModule {
  constructor() {}
}

```

create a `.env` file and insert your configurations

```bash
touch .env && echo 'APP_TEST=true' > .env
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

## Use

### Get

Get a parameter from the config

```typescript
this.config.get('APP_TEST');
```
With a default option

```typescript
this.config.get('APP_TEST', false);
```

### Has

Check your config has a parameter defined

```typescript
this.config.has('APP_TEST');
```


import { Controller, Get } from '@nest/common';
import { ConfigParam, Configurable } from 'nestjs-config';

@Controller('user')
export default class UserController {
  @Get('')
  @Configurable()
  index(
    @ConfigParam('user.name', 'test') username,
    @ConfigParam('app.development') live,
  ): object {
    return {
      username: username,
      live: live,
    };
  }
}

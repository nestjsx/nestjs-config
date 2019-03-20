import { Controller, Get } from '@nest/common';
import { InjectConfigService } from 'nestjs-config';
import * as pug from 'pug';

@Controller('user')
export default class UserController {
  constructor(@InjectConfigService() private readonly config) {}

  @Get('')
  index(): object {
    const username = this.config.get('user.name', 'test');
    const live = this.config.has('app.development');

    return {
      username: username,
      live: live,
    };
  }

  @Get('test')
  test() {
    //just an example for src
    return pug.renderFile(
      this.config.src('templates/test.pug', {
        title: this.config.get('TITLE'),
      }),
    );
  }
}

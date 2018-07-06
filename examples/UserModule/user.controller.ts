import { Controller, Get } from "@nest/common";
import { ConfigService } from "@bashleigh/nest-config";
import * as pug from 'pug';

@Controller("user")
export default class UserController {
  constructor(readonly config: ConfigService) {}

  @Get("")
  index(): object {
    const username = this.config.get("username", "test");
    const live = this.config.has("live");

    return {
      username: username,
      live: live
    };
  }

  @Get('test')
  test() {
    //just an example for src
    return pug.renderFile(this.config.src('templates/test.pug', {
      title: this.config.get('TITLE'),
    }));
  }
}

import {
    Controller,
    Get,
} from '@nest/common';

import ConfigService from '@bashleigh/config.service';

@Controller('user')
export default class UserController {
    constructor(readonly config: ConfigService) {}

    @Get('')
    index() : object {
        const username = this.config.get('username', 'test');
        const live = this.config.has('live');

        return {
            username: username,
            live: live,
        };
    }
}
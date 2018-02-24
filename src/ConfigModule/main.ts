import {
    Module,
} from '@nestjs/common';

import ConfigService from './config.service';

@Module({
    components: [
        ConfigService,
    ],
})
export default class ConfigModule {}
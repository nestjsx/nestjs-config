import { Module } from '@nestjs/common';
import { ConfigModule } from 'nestjs-config';
import * as path from 'path';

import UserController from './user.controller';

@Module({
  imports: [
    ConfigModule.forRootAsync(
      path.resolve(__dirname, 'config', '**/!(*.d).{ts,js}'),
    ),
  ],
  controllers: [UserController],
})
export default class UserModule {}

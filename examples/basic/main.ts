import { Module } from '@nestjs/common';
import { ConfigModule } from 'nestjs-config';
import * as path from 'path';

import UserController from './user.controller';

@Module({
  imports: [
    ConfigModule.load(path.resolve(__dirname, 'config', '**/(!*.d).{ts,js}')),
  ],
  controllers: [UserController],
})
export default class UserModule {}

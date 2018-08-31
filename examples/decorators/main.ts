import { Module } from '@nestjs/common';
import { ConfigModule } from 'nestjs-config';
import UserController from './user.controller';
import * as path from 'path';

@Module({
  imports: [
    ConfigModule.load(path.resolve(__dirname, 'config', '*/**.{ts,js}')),
  ],
  controllers: [UserController],
})
export default class UserModule {}

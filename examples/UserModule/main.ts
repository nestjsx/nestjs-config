import { Module } from "@nestjs/common";

import ConfigModule from "@bashleigh/nest-config";

import UserController from "./user.controller";

@Module({
  imports: [ConfigModule],
  controllers: [UserController]
})
export default class UserModule {}

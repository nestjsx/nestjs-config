import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from 'nestjs-config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as path from 'path';

@Module({
  imports: [
    ConfigModule.load(path.resolve(__dirname, 'config/**/!(*.d).{ts,js}')),
    TypeOrmModule.forRootAsync({
      useFactory: async (config: ConfigService) => config.get('database'),
      inject: [ConfigService],
    }),
  ],
})
export default class AppModule {}

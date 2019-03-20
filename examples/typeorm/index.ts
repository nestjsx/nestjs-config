import { Module } from '@nestjs/common';
import { ConfigModule } from 'nestjs-config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as path from 'path';
import DatabaseConfig from './config/database';

@Module({
  imports: [
    ConfigModule.forRootAsync(
      path.resolve(__dirname, 'config/**/!(*.d).{ts,js}'),
    ),
    TypeOrmModule.forRootAsync({
      useFactory: async (config: DatabaseConfig) => config,
      inject: [DatabaseConfig],
    }),
  ],
})
export default class AppModule {}

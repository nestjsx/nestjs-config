import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from 'nestjs-config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as path from 'path';

//Load the configservice before the initial module load
ConfigService.load(path.resolve(__dirname, 'config/**/*.{ts,js}'));

@Module({
  imports: [
    ConfigModule.load(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => config.get('database'),
      inject: [ConfigService],
    }),
  ],
})
export default class AppModule {}

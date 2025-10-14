import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          type: 'postgres',
          host: configService.getOrThrow<string>('database.host'),
          port: configService.getOrThrow<number>('database.port'),
          database: configService.getOrThrow<string>('database.name'),
          username: configService.getOrThrow<string>('database.user'),
          password: configService.getOrThrow<string>('database.password'),
          entities: [__dirname + '/../**/**/*.entity.{js,ts}'],
          migrations: [__dirname + '/migrations/*.{js,ts}'],
          migrationsTableName: 'migrations',
          migrationsRun: true,
          synchronize: false,
          dropSchema: false,
          logging: true,
        };
      },
    }),
  ],
})
export class DatabaseModule {}

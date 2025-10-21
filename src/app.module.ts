import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { Token } from './models/token.entity';
import { Chain } from './models/chain.entity';
import { Logo } from './models/logo.entity';
import { TokenPriceUpdateModule } from './token/token-price-update.module';
import { TokenPriceUpdateService } from './token/token-price-update.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'postgres'),
        database: configService.get<string>('DB_NAME', 'tokens'),
        entities: [Token, Chain, Logo],
        // include only generated migrations, exclude run-migration.ts as it was running on every start up
        migrations: [__dirname + '/migrations/*[0-9]*.{js,ts}'],
        // disable migrations run on application start up, migrations are run manually via npm run migration:run
        migrationsRun: false,
        synchronize: false,
      }),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([Token, Chain, Logo]),
    TokenPriceUpdateModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements OnModuleInit {
  private readonly logger = new Logger(AppModule.name);
  
  constructor(
    private readonly tokenPriceUpdateService: TokenPriceUpdateService,
  ) {}

  async onModuleInit() {
    try {
      this.logger.log('Token price update service is scheduled to run every 5 seconds');
      this.logger.log('To seed the database, run: npm run db:seed');
    } catch (error) {
      this.logger.error('Failed to initialize application:', error);
      throw error;
    }
  }
}

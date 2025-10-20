import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { getPostgresCredentials } from "./helpers/get-db-credentials.helper";
import * as path from "node:path";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: async (configService: ConfigService) => {
        return {
          type: "postgres",
          ...getPostgresCredentials(configService),
          synchronize: false,
          entities: [path.join(__dirname, "**", "*.entity.{ts,js}")],
          autoLoadEntities: true,
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class PostgresModule {}

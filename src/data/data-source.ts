import { DataSource } from "typeorm";
import { Token } from "../modules/token-price/entities/token.entity";
import { AddTokenPrices1759347284290 } from "src/migrations/1759347284290-AddTokenPrices";
import { AddOutbox1759349444145 } from "src/migrations/1759349444145-AddOutbox";
import { MigrateDataToNormalizedSchema1759440070537 } from "src/migrations/1759440070537-MigrateDataToNormalizedSchema";
import { CreateNormalizedSchema1759432869842 } from "src/migrations/1759432869842-CreateNormalizedSchema";
import { RemovePriceFromTokens1759431252298 } from "src/migrations/1759431252298-RemovePriceFromTokens";
import { AddOutboxProcessing1759443365901 } from "src/migrations/1759443365901-AddOutboxProcessing";
import { InitialMigration1684654321000 } from "src/migrations/1684654321000-InitialMigration";
import { DatabaseType } from "src/shared/enums/environment.enum";

export const AppDataSource = new DataSource({
  type: DatabaseType.POSTGRES,
  host: process.env["PG_HOST"] || "localhost",
  port: Number(process.env["PG_PORT"]) || 5432,
  username: process.env["PG_USER"] || "postgres",
  password: process.env["PG_PASSWORD"] || "password",
  database: process.env["PG_DB"] || "token_price_service",
  entities: [Token],
  migrations: [
    InitialMigration1684654321000,
    AddTokenPrices1759347284290,
    AddOutbox1759349444145,
    RemovePriceFromTokens1759431252298,
    CreateNormalizedSchema1759432869842,
    MigrateDataToNormalizedSchema1759440070537,
    AddOutboxProcessing1759443365901,
  ],
  synchronize: false, // Set to false when using migrations
  logging: true,
});

import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";
import { extname, join } from "path";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";

export function dbConnectOptions(): PostgresConnectionOptions {
  let ext_name = extname(__filename);
  let folder = ext_name === ".ts" ? "src" : "dist";

  return {
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "postgres",
    database: "tokens",
    entities: [join(`${folder}/core/**/*.entity${ext_name}`)],
    migrations: [join(__dirname, `../migrations/*${ext_name}`)],
    migrationsTableName: "migrations_history",
    migrationsTransactionMode: "all",
    synchronize: false,
    logging: true,
    migrationsRun: false,
    namingStrategy: new SnakeNamingStrategy(),
  };
}

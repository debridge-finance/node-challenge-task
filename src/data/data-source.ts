import { DataSource } from 'typeorm';
import { Token } from '../models/token.entity';
import { Chain } from '../models/chain.entity';
import { Logo } from '../models/logo.entity';
import { OutboxEvent } from '../models/outbox-event.entity';
import { InitialMigration1684654321000 } from '../migrations/1684654321000-InitialMigration';
import { NormalizeDatabaseStructure1735123456789 } from '../migrations/1735123456789-NormalizeDatabaseStructure';
import { AddOutboxTable1759678113262 } from '../migrations/1759678113262-AddOutboxTable';
import { FixTokenDataTypes1759678511784 } from '../migrations/1759678511784-FixTokenDataTypes';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'tokens',
  entities: [Token, Chain, Logo, OutboxEvent],
  migrations: [InitialMigration1684654321000, NormalizeDatabaseStructure1735123456789, AddOutboxTable1759678113262, FixTokenDataTypes1759678511784],
  synchronize: false, // Set to false when using migrations
  logging: true,
});

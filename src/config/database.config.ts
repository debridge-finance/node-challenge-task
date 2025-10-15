const host = process.env.DB_HOST || 'localhost';
const port = process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432;
const name = process.env.DB_NAME || 'tokens';
const user = process.env.DB_USER || 'postgres';
const password = process.env.DB_PASSWORD ?? 'postgres';

export const databaseConfig = {
  host,
  port,
  name,
  user,
  password,
};

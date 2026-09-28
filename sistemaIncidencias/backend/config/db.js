import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;


//usar .env
const pool = new Pool({
  host: process.env.host,
  port: process.env.port,
  database: process.env.database,
  user: process.env.user,
  password: process.env.password,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

export default pool;
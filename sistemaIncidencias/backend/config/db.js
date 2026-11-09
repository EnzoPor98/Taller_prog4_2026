import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;


//usar .env
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

export default pool;

// import pg from 'pg';
// import 'dotenv/config';

// const { Pool } = pg;

// const pool = new Pool({
//     connectionString: process.env.DATABASE_URL,
//     max: 1,
//     idleTimeoutMillis: 30000,
//     connectionTimeoutMillis: 10000,
//     ssl: {
//         rejectUnauthorized: false
//     }
// });

// pool.on('error', (error) => {
//     console.error('Error inesperado en PostgreSQL:', error);
// });

// export default pool;
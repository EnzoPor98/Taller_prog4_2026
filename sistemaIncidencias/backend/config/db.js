import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

// Si existe DATABASE_URL se usa Supabase (con SSL, como en Vercel).
// Si no, se conecta al Postgres local usando las variables DB_*.
const config = process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        max: 1,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
        ssl: {
            rejectUnauthorized: false
        }
    }
    : {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000
    };

const pool = new Pool(config);

pool.on('error', (error) => {
    console.error('Error inesperado en PostgreSQL:', error);
});

export default pool;

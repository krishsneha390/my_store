import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

pool.connect()
    .then(() => console.log("Connected to Render PostgreSQL 🎉"))
    .catch(err => console.error("DB Connection Failed ❌", err));

export default pool;

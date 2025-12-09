import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }  // required for Render hosting
});

// Test DB connection
pool.connect()
    .then(() => console.log("🟢 Connected to PostgreSQL (Render Hosted DB)"))
    .catch(err => console.error("🔴 Database Connection Failed:\n", err));

export default pool;

import { pool } from "./db.js";

async function setup() {
  try {
    console.log("⏳ Creating Tables...");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories(
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        slug VARCHAR(100) UNIQUE
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS products(
        id SERIAL PRIMARY KEY,
        name VARCHAR(200),
        brand VARCHAR(200),
        price NUMERIC,
        image TEXT,
        category_id INTEGER REFERENCES categories(id)
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders(
        id SERIAL PRIMARY KEY,
        customer_name VARCHAR(100),
        phone VARCHAR(20),
        address TEXT,
        total NUMERIC,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS order_items(
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id),
        product_id INTEGER,
        name TEXT,
        price NUMERIC,
        qty INTEGER
      );
    `);

    console.log("🎉 Tables Created Successfully!");
  } 
  catch (err) {
    console.log("❌ Setup Error:", err);
  }
  finally {
    console.log("🔌 Closing DB connection...");
    pool.end();
    process.exit();
  }
}

setup();

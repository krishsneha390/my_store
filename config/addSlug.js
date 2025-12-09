import pool from "./db.js";

async function addSlugColumn() {
  try {
    await pool.query(`
      ALTER TABLE products 
      ADD COLUMN slug TEXT;
    `);

    console.log("✔ slug column added to products table");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
}

addSlugColumn();

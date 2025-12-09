import pool from "./db.js";

async function addUnique() {
  try {
    await pool.query(`
      ALTER TABLE products
      ADD CONSTRAINT products_slug_key UNIQUE (slug);
    `);

    console.log("✔ UNIQUE constraint added to slug column");
    process.exit(0);
  } catch (err) {
    console.error("❌ Failed:", err.message);
    process.exit(1);
  }
}

addUnique();

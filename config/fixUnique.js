import pool from "./db.js";

async function addUnique() {
  try {
    console.log("Adding UNIQUE INDEX on products.slug ...");

    await pool.query(`
      ALTER TABLE products 
      ADD CONSTRAINT products_slug_key UNIQUE(slug);
    `);

    console.log("✔ UNIQUE constraint added successfully!");
  } catch (err) {
    if (err.code === '42710') {
      console.log("✔ UNIQUE already exists.");
    } else {
      console.error("❌ ERROR:", err.message);
    }
  } finally {
    pool.end();
  }
}

addUnique();

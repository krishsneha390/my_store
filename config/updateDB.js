import pool from "./db.js";

async function updateDB() {
  try {
    await pool.query(`
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS description TEXT,
      ADD COLUMN IF NOT EXISTS highlights TEXT,
      ADD COLUMN IF NOT EXISTS image2 TEXT,
      ADD COLUMN IF NOT EXISTS image3 TEXT,
      ADD COLUMN IF NOT EXISTS image4 TEXT,
      ADD COLUMN IF NOT EXISTS image5 TEXT
    `);

    console.log("🛠 Products table updated successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Update Failed:", err);
    process.exit(1);
  }
}

updateDB();

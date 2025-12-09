import xlsx from "xlsx";
import pool from "../config/db.js";

async function uploadCategories() {
  try {
    console.log("Connected to DB...");

    // 1. Read Excel
    const file = xlsx.readFile("categories.xlsx");
    const sheet = file.Sheets[file.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);

    for (let row of rows) {
      if (!row["Leaf Category Tab"]) continue; // skip empty rows

      let categoryName = row["Leaf Category Tab"].trim();

      await pool.query(
        `INSERT INTO categories (name) 
         VALUES ($1)
         ON CONFLICT (name) DO NOTHING`,
        [categoryName]
      );

      console.log("✔ Added:", categoryName);
    }

    console.log("\n🎉 Category Upload Completed!\n");
    process.exit();
  } catch (err) {
    console.error("❌ Upload Failed:", err);
    process.exit();
  }
}

uploadCategories();

import xlsx from "xlsx";
import pool from "../config/db.js";
import stringSimilarity from "string-similarity";

function normalize(text) {
  if (!text) return "";
  return text.replace(/\s+/g, " ").trim().toLowerCase();
}

console.log("📘 Reading today's Excel...");
const todayFile = xlsx.readFile("basic900216800021export1765448106494_1211-18-15-06.xlsx");
const todaySheet = todayFile.Sheets[todayFile.SheetNames[0]];
const todayRows = xlsx.utils.sheet_to_json(todaySheet);

console.log("📘 Reading yesterday's Excel (exact DB names)...");
const yesterdayFile = xlsx.readFile("working.xlsx");
const yesterdaySheet = yesterdayFile.Sheets[yesterdayFile.SheetNames[0]];
const yesterdayRows = xlsx.utils.sheet_to_json(yesterdaySheet);

// BUILD NAME MAP
let dbNameMap = yesterdayRows.map(r => normalize(r["Product Name"] || r.name || ""));

let updated = 0, skipped = 0;

(async () => {
  console.log("🟢 Loading product IDs from DB...");
  const db = await pool.query("SELECT id, name FROM products");
  const dbProducts = db.rows;

  console.log(`📦 DB products loaded: ${dbProducts.length}`);

  let index = 0;

  for (const row of todayRows) {
    index++;

    const excelNameRaw =
      row["*Product Name(Nepali) look function"] ||
      row["Product Name(Nepali) look function"] ||
      row["originalLocalName"];

    if (!excelNameRaw) {
      skipped++;
      continue;
    }

    const excelName = normalize(excelNameRaw);

    // 1️⃣ DIRECT MATCH FIRST
    let dbProduct = dbProducts.find(p => normalize(p.name) === excelName);

    // 2️⃣ IF NO MATCH → FUZZY MATCH USING YESTERDAY'S SHEET
    if (!dbProduct) {
      const matches = stringSimilarity.findBestMatch(
        excelName,
        dbProducts.map(p => normalize(p.name))
      );

      if (matches.bestMatch.rating >= 0.6) {   // threshold 60%
        dbProduct = dbProducts[matches.bestMatchIndex];
      }
    }

    // 3️⃣ STILL NOT FOUND → SKIP
    if (!dbProduct) {
      skipped++;
      continue;
    }

    const id = dbProduct.id;

    const image2 = row["Product Images2"] || null;
    const image3 = row["Product Images3"] || null;
    const description = row["Main Description"] || "";

    await pool.query(
      `UPDATE products 
       SET image2 = $1, image3 = $2, description = $3 
       WHERE id = $4`,
      [image2, image3, description, id]
    );

    updated++;

    // Live progress
    if (index % 10 === 0) {
      console.log(`Progress: ${index}/${todayRows.length} processed...`);
    }
  }

  console.log("\n🎉 UPDATE COMPLETE!");
  console.log("Total Updated:", updated);
  console.log("Total Skipped:", skipped);

  process.exit();
})();

import db from "../config/db.js";
import xlsx from "xlsx";

const workbook = xlsx.readFile("products.xlsx");       // file must be in project root
const sheet = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

let updated = 0;

for (const row of sheet) {
    const excelName = row["name"]?.trim().toLowerCase();
    const image = row["*Product Images1"]?.trim();

    if (!excelName || !image) continue;

    // Partial match update
    const result = await db.query(
        "UPDATE products SET image=$1 WHERE LOWER(name) LIKE '%' || $2 || '%'",
        [image, excelName]
    );

    if (result.rowCount > 0) {
        console.log(`✔ Updated: ${excelName} (${result.rowCount} rows)`);
        updated += result.rowCount;
    }
}

console.log(`\n🔥 Completed — ${updated} product images updated successfully`);
process.exit();

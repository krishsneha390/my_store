import db from "../config/db.js";
import xlsx from "xlsx";

const workbook = xlsx.readFile("All_Products_Image_Match_V3.xlsx"); // file must be in root
const sheet = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

let updated = 0;

for (const row of sheet) {
    const name = row.db_name?.trim();
    const image = row.image_url?.trim();
    const status = row.status;

    if (status === "Matched" && image && name) {
        await db.query("UPDATE products SET image=$1 WHERE name=$2", [image, name]);
        console.log("✔ Updated:", name);
        updated++;
    }
}

console.log(`\n🔥 Image Update Completed — ${updated} products updated.`);
process.exit();

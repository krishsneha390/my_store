import db from "../config/db.js";
import xlsx from "xlsx";

const workbook = xlsx.readFile("products_update.xlsx");   // <-- IMPORTANT
const sheet = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

let updated = 0;

for (const row of sheet) {
    const excelName = row["name"]?.trim().toLowerCase();
    let price = row["Price"];

    if(!excelName || price == null) continue;

    // Clean price
    price = String(price).replace(/[^0-9.]/g,"").trim();
    if(price === "" || isNaN(price)) continue;
    price = Number(price);

    const result = await db.query(
        "UPDATE products SET price=$1 WHERE LOWER(name) LIKE '%' || $2 || '%'",
        [price, excelName]
    );

    if(result.rowCount > 0){
        console.log(`✔ Price Updated → ${excelName} = Rs ${price}`);
        updated += result.rowCount;
    }
}

console.log(`\n🔥 Completed — ${updated} products updated successfully`);
process.exit();

import db from "../config/db.js";
import xlsx from "xlsx";

const workbook = xlsx.readFile("products.xlsx");
const sheet = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

// Fetch DB products
const dbProducts = (await db.query("SELECT id,name FROM products")).rows;

let found = 0, notFound = [];

for (const row of sheet) {
    const excelName = row["name"]?.trim().toLowerCase();
    if (!excelName) continue;

    const match = dbProducts.find(p => p.name.toLowerCase().includes(excelName));

    if (match) {
        console.log(`✔ MATCH: Excel "${excelName}"  -> DB "${match.name}"`);
        found++;
    } else {
        notFound.push(excelName);
    }
}

console.log(`\n-----------------------------------------`);
console.log(`Matched: ${found}`);
console.log(`Not Found: ${notFound.length}`);
console.log("-----------------------------------------`");

console.log("\n❗ FIRST 50 NOT FOUND PRODUCTS:");
console.log(notFound.slice(0,50));
process.exit();

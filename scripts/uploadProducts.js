import xlsx from "xlsx";
import pool from "../config/db.js";
import dotenv from "dotenv";
dotenv.config();

async function uploadProducts() {
    try {
        console.log("📄 Reading Excel file...");
        
        const file = xlsx.readFile("products.xlsx");     // <-- use cleaned file
        const sheet = file.Sheets[file.SheetNames[0]];
        const rows = xlsx.utils.sheet_to_json(sheet);

        console.log(`📥 Loaded ${rows.length} products from Excel`);

        const client = await pool.connect();
        let inserted = 0;

        for (let row of rows) {
            const name = row.name?.trim();
            if (!name) continue;                       // skip empty rows

            // Insert only name for now (price & category null)
            const result = await client.query(
                "INSERT INTO products (name, price, category_id, image, description) VALUES ($1, NULL, NULL, NULL, NULL) ON CONFLICT (name) DO NOTHING RETURNING id",
                [name]
            );

            if (result.rowCount > 0) inserted++;
        }

        client.release();
        console.log(`✅ Successfully added ${inserted} new products`);
        console.log("⚠ Update price & category later in admin panel");

    } catch (err) {
        console.error("❌ Upload Failed:", err);
    }
}

uploadProducts();

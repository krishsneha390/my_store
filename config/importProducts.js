import dotenv from "dotenv";
import xlsx from "xlsx";
import path from "path";
import { fileURLToPath } from "url";
import { pool } from "./db.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, "products.xlsx");
console.log("📄 Reading file:", filePath);

async function importProducts() {
    try {
        // Create table if not exists
        await pool.query(`
            CREATE TABLE IF NOT EXISTS products (
                id SERIAL PRIMARY KEY,
                name TEXT,
                slug TEXT UNIQUE,
                description TEXT,
                price NUMERIC DEFAULT 0,
                stock INTEGER DEFAULT 0,
                image TEXT
            );
        `);

        console.log("🛠 Table ready!");

        const workbook = xlsx.readFile(filePath);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(sheet);

        console.log(`📦 Total Products Found: ${data.length}`);

        for (let p of data) {

    const name = p["Product Name(English)"];
    if (!name) {
        console.log("⛔ Skipped row (No English Name):", p);
        continue;
    }
    
    const image = p["Product Images1"];
    const description = p["Highlights"] || "No description";
    const price = Number(p["Price"]) || 0;
    const stock = Number(p["Stock"]) || 0;

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    await pool.query(`
        INSERT INTO products (name, slug, description, price, stock, image)
        VALUES ($1,$2,$3,$4,$5,$6)
        ON CONFLICT (slug) DO UPDATE SET 
            description = EXCLUDED.description,
            price = EXCLUDED.price,
            stock = EXCLUDED.stock,
            image = EXCLUDED.image;
    `, [name, slug, description, price, stock, image]);

    console.log("✔ Saved:", name);
}

        console.log("🎉 Import finished!");
        process.exit();

    } catch (err) {
        console.log("❌ ERROR:", err);
        process.exit();
    }
}

importProducts();

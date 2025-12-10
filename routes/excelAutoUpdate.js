import express from "express";
import XLSX from "xlsx";
import Product from "../models/productModel.js";

const router = express.Router();

router.get("/update-products", async (req, res) => {
    try {
        const filePath = "working.xlsx";   // 👈 Your uploaded file name
        
        const workbook = XLSX.readFile(filePath);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(sheet);

        for (let item of data) {
            const name = item["*Product Name(Nepali) look function"];
            const image = item["*Product Images1"];
            const price = item["SpecialPrice"];

            if (!name) continue;

            console.log("Updating:", name);

            await Product.updateByName(name, {
                name,
                price,
                image
            });
        }

        res.send("✔ Products updated from Excel successfully!");
    }
    catch (err) {
        console.log(err);
        res.send("❌ Failed to update products");
    }
});

export default router;

import express from "express";
import multer from "multer";
import XLSX from "xlsx";
import Product from "../models/productModel.js";

const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.get("/admin/excel-update", (req, res) => {
    res.render("admin/excel-update");
});

router.post("/admin/excel-update", upload.single("excelFile"), async (req, res) => {
    try {
        const workbook = XLSX.readFile(req.file.path);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(sheet);

        // reading columns from your excel format
        for (let item of data) {
            const name = item["*Product Name(Nepali) look function"];
            const image = item["*Product Images1"];
            const price = item["SpecialPrice"];

            if (!name) continue;

            console.log(`Updating: ${name}`);

            await Product.updateByName(name, {
                name,
                price,
                image
            });
        }

        res.send("✔ All products updated successfully!");
    } catch (error) {
        console.log(error);
        res.send("❌ Error processing file");
    }
});

export default router;

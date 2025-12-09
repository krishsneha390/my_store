import express from "express";
import multer from "multer";
import xlsx from "xlsx";
import Product from "../models/productModel.js";
import Category from "../models/categoryModel.js";

const router = express.Router();

// Upload Excel config
const upload = multer({ dest: "uploads/" });

// Upload Page
router.get("/admin/bulk-upload", async (req, res) => {
    const categories = await Category.getAll();
    res.render("admin/bulk-upload", { categories });
});

// Upload Excel → Insert into DB
router.post("/admin/bulk-upload", upload.single("file"), async (req, res) => {
    try {
        const workbook = xlsx.readFile(req.file.path);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(sheet);

        let count = 0;

        for (let row of data) {
            await Product.create({
                name: row["Product Name"],
                price: row["Price"],
                category_id: row["Category ID"] || 1,     // Default Category if missing
                image: row["Image"] || "no-image.jpg",   // Optional
                description: row["Description"] || ""
            });
            count++;
        }

        res.send(`✅ ${count} Products Inserted Successfully`);
    } catch (err) {
        console.log(err);
        res.send("❌ Error uploading products");
    }
});

export default router;

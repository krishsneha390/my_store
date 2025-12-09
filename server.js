// ================== IMPORTS AT TOP ==================
import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import pool from "./config/db.js";

// Import Routes (must always be at top)
import adminRoutes from "./routes/adminRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import Product from "./models/productModel.js";
// =====================================================

// Load env
dotenv.config();

// Fix __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ================== MIDDLEWARE ==================
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); 
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
// =================================================

// ================== USE ROUTES ==================
app.use("/", productRoutes);     // shop side routes
app.use("/", adminRoutes);       // admin panel routes
// =================================================

// Home Page (already handled in productRoutes.js but keeping for safety)
app.get("/", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM products ORDER BY id DESC");
        res.render("shop/home", { products: result.rows });
    } catch (err) {
        console.log(err);
        res.render("shop/home", { products: [] });
    }
});

// TEMP manual fallback route (OPTIONAL, safe)
app.get("/add-product", (req, res) => {
    res.render("admin/add-product");
});

app.post("/add-product", async (req, res) => {
    const { name, price, category_id, image, description } = req.body;
    await Product.create({ name, price, category_id, image, description });
    res.redirect("/admin/products");
});

// ================== START SERVER ==================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Running at http://localhost:${PORT}`));

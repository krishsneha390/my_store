import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import pool from "./config/db.js";   // PostgreSQL connection

import adminRoutes from "./routes/adminRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import shopRoutes from "./routes/shopRoutes.js";

dotenv.config();

const app = express();

// ES module compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes
app.use("/admin", adminRoutes);
app.use("/admin/products", productRoutes);
app.use("/", shopRoutes);

// Start Server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} 🚀`);
});

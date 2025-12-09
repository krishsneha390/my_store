import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import pool from "./config/db.js";
import session from "express-session";

import Order from "./models/orderModel.js";
import Admin from "./models/adminModel.js";

dotenv.config();

// RUN ONLY ONCE — comment after first success
await Order.createTable();
await Admin.createTable();
await Admin.seedDefault();
// After working once, DELETE or COMMENT ABOVE to prevent re-running.

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static("public/uploads"));

app.use(session({
    secret: "mySecretKey123",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24*60*60*1000 }
}));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

import adminRoutes from "./routes/adminRoutes.js";
import productRoutes from "./routes/productRoutes.js";

app.use("/", productRoutes);
app.use("/", adminRoutes);

app.get("/", async (req,res) => {
    const result = await pool.query("SELECT * FROM products");
    res.render("shop/home", { products: result.rows });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log(`🚀 Running http://localhost:${PORT}`));

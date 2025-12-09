import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";
import pool from "./config/db.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static("public/uploads"));

// Sessions
app.use(session({
    secret: "mySecretKey123",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24*60*60*1000 }
}));

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes
import adminRoutes from "./routes/adminRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import bulkUploadRoutes from "./routes/bulkUpload.js";

app.use("/", productRoutes);
app.use("/admin", adminRoutes);
app.use("/", bulkUploadRoutes);

// Default homepage
app.get("/", async (req, res) => {
    const result = await pool.query("SELECT * FROM products LIMIT 20");
    res.render("shop/home", { products: result.rows });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
    console.log(`🚀 Server running at http://localhost:${PORT}`)
);

import express from "express";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";

import shopRoutes from "./routes/shopRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import bulkUploadRoutes from "./routes/bulkUpload.js";
import excelUpdateRoute from "./routes/excelUpdateRoute.js";
import excelAutoUpdate from "./routes/excelAutoUpdate.js";
import resetImport from "./routes/resetImport.js";
import "./config/db.js";

const app = express();

// Path Fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Request & Body Limits ---
app.use(express.json({ limit: "200mb" }));
app.use(express.urlencoded({
    extended: true,
    limit: "200mb",
    parameterLimit: 100000,
}));

// --- Static Folder ---
app.use(express.static(path.join(__dirname, "public")));

// ==========================================
// 🚨 MOST IMPORTANT (Fix missing GPS saving)
// ==========================================
app.use(session({
    secret: "MyStoreSecretKey123",    // change if you want
    resave: false,
    saveUninitialized: true,          // MUST BE true for checkout session
    cookie: { maxAge: 24 * 60 * 60 * 1000 } // 1 day
}));

// --- View Engine ---
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ==========================================
// ROUTES (Order optimized)
// ==========================================
app.use("/", shopRoutes);
app.use("/admin", adminRoutes);

app.use("/bulk", bulkUploadRoutes);

app.use("/admin", excelUpdateRoute);
app.use(excelAutoUpdate);

app.use("/admin", resetImport);

// ==========================================
// Server Start
// ==========================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log(`🚀 Server running on http://localhost:${PORT}`));

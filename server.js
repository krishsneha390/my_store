import express from "express";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import productRoutes from "./routes/productRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import bulkUploadRoutes from "./routes/bulkUpload.js";
import "./config/db.js";   // ensure DB connects

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ----------------------------------------------------------
   FIX: Increase request limit to avoid "Payload Too Large"
----------------------------------------------------------- */
app.use(express.json({ limit: "200mb" }));
app.use(express.urlencoded({
    extended: true,
    limit: "200mb",
    parameterLimit: 100000,   // <-- FIX for too many form inputs
}));


/* If using multer anywhere (just for future reference)
   you can set file upload limit there likewise */
// import multer from "multer";
// const upload = multer({ limits: { fileSize: 50 * 1024 * 1024 } });

/* ---------------------------------------------------------- */

app.use(express.static(path.join(__dirname, "public")));

app.use(session({
    secret: "your-secret-key",       // change to strong key later
    resave: false,
    saveUninitialized: false
}));

// View Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes
app.use("/", productRoutes);
app.use("/admin", adminRoutes);
app.use("/bulk", bulkUploadRoutes);

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

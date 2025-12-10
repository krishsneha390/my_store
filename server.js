import express from "express";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";

import shopRoutes from "./routes/shopRoutes.js";      // <-- CHANGED
import adminRoutes from "./routes/adminRoutes.js";
import bulkUploadRoutes from "./routes/bulkUpload.js";

import "./config/db.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json({ limit: "200mb" }));
app.use(express.urlencoded({
    extended: true,
    limit: "200mb",
    parameterLimit: 100000,
}));

app.use(express.static(path.join(__dirname, "public")));

app.use(session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false
}));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// --------------------------------------------------
// ROUTES FIXED
// --------------------------------------------------
app.use("/", shopRoutes);            // <-- new frontend routes
app.use("/admin", adminRoutes);
app.use("/bulk", bulkUploadRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

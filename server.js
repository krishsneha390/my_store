// server.js
import express from "express";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import passport from "passport";

import shopRoutes from "./routes/shopRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import bulkUploadRoutes from "./routes/bulkUpload.js";
import excelUpdateRoute from "./routes/excelUpdateRoute.js";
import excelAutoUpdate from "./routes/excelAutoUpdate.js";
import resetImport from "./routes/resetImport.js";
import authRoutes from "./routes/authRoutes.js";

import "./config/db.js";
import configurePassport from "./config/passport.js";
import accountRoutes from "./routes/accountRoutes.js";

import checkoutRoutes from "./routes/checkout.js";

const app = express();

/* ================= PATH FIX ================= */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ================= BODY PARSER ================= */
app.use(express.json({ limit: "200mb" }));
app.use(
  express.urlencoded({
    extended: true,
    limit: "200mb",
    parameterLimit: 100000,
  })
);

/* ================= STATIC FILES ================= */
app.use(express.static(path.join(__dirname, "public")));

/* ================= SESSION CONFIG ================= */
app.use(
  session({
    secret: process.env.SESSION_SECRET || "MyStoreSecretKey123",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }, // 1 day
  })
);

/* ================= PASSPORT INIT ================= */
configurePassport();
app.use(passport.initialize());
app.use(passport.session());

/* ================= EJS GLOBAL SESSION ================= */
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

/* ================= VIEW ENGINE ================= */
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

/* ================= ROUTES ================= */
app.use("/", authRoutes); // auth + google
app.use("/", shopRoutes);
app.use("/admin", adminRoutes);
app.use("/bulk", bulkUploadRoutes);

app.use("/admin", excelUpdateRoute);
app.use(excelAutoUpdate);

app.use("/admin", resetImport);

app.use("/", accountRoutes);
app.use("/checkout", checkoutRoutes);

/* ================= START SERVER ================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

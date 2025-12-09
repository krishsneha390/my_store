// app.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";
import productRoutes from "./routes/productRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import bulkUploadRoutes from "./routes/bulkUpload.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// middlewares, view engine, static, etc
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "your-secret",
    resave: false,
    saveUninitialized: false,
  })
);

// routes
app.use("/", productRoutes);
app.use("/admin", adminRoutes);
app.use("/bulk", bulkUploadRoutes);

export default app;

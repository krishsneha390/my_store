import express from "express";
import Product from "../models/productModel.js";
import Order from "../models/orderModel.js";
import Category from "../models/categoryModel.js";
import Admin from "../models/adminModel.js";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";

const router = express.Router();

//////////////////// AUTH MIDDLEWARE ////////////////////
function auth(req, res, next) {
    if (!req.session.admin) return res.redirect("/admin/login");
    next();
}
/////////////////////////////////////////////////////////


//////////////////// MULTER SETUP (IMAGE UPLOAD) ////////////////////
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "public/uploads"),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage });
///////////////////////////////////////////////////////////////////


// -------------------- LOGIN --------------------
router.get("/admin/login", (req, res) => {
    res.render("admin/login");
});

router.post("/admin/login", async (req, res) => {
    const { username, password } = req.body;

    const admin = await Admin.findByUser(username);
    if (!admin) return res.send("❌ User not found");

    const match = await bcrypt.compare(password, admin.password);
    if (!match) return res.send("❌ Wrong password");

    req.session.admin = admin;
    res.redirect("/admin");
});

// LOGOUT
router.get("/admin/logout", (req, res) => {
    req.session.destroy(() => res.redirect("/admin/login"));
});


// -------------------- DASHBOARD --------------------
router.get("/admin", auth, (req, res) => {
    res.render("admin/dashboard");
});


// -------------------- CATEGORY ROUTES --------------------
router.get("/admin/add-category", auth, (req, res) => {
    res.render("admin/add-category");
});

router.post("/admin/add-category", auth, async (req, res) => {
    const { name } = req.body;
    await Category.create(name);
    res.redirect("/admin/categories");
});

router.get("/admin/categories", auth, async (req, res) => {
    const categories = await Category.getAll();
    res.render("admin/categories", { categories });
});


// -------------------- PRODUCT ROUTES --------------------
router.get("/admin/add-product", auth, async (req, res) => {
    const categories = await Category.getAll(); 
    res.render("admin/add-product", { categories });
});

// 🔥 UPDATED - supports image upload now
router.post("/admin/add-product", auth, upload.single("image"), async (req, res) => {
    const { name, price, category_id, description } = req.body;
    const image = req.file ? "/uploads/" + req.file.filename : null;


    await Product.create({ name, price, category_id, image, description });
    res.redirect("/admin/products");
});

router.get("/admin/products", auth, async (req, res) => {
    const products = await Product.getAll();
    res.render("admin/products", { products });
});


// -------------------- ORDERS --------------------
router.get("/admin/orders", auth, async (req, res) => {
    const orders = await Order.getAll();
    res.render("admin/orders", { orders });
});

export default router;

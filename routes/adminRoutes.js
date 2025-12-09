import express from "express";
import Product from "../models/productModel.js";
import Order from "../models/orderModel.js";
import Category from "../models/categoryModel.js";
import Admin from "../models/adminModel.js";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";

const router = express.Router();

/* -------------------- AUTH MIDDLEWARE -------------------- */
function auth(req, res, next) {
    if (!req.session.admin) return res.redirect("/admin/login");
    next();
}

/* -------------------- IMAGE UPLOAD (multer) -------------------- */
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "public/uploads"),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage });

/* -------------------- LOGIN -------------------- */
router.get("/login", (req, res) => {
    res.render("admin/login");
});

router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    const admin = await Admin.findByUser(username);
    if (!admin) return res.send("❌ User not found");

    const match = await bcrypt.compare(password, admin.password);
    if (!match) return res.send("❌ Wrong password");

    req.session.admin = admin;
    res.redirect("/admin");
});

router.get("/logout", (req, res) => {
    req.session.destroy(() => res.redirect("/admin/login"));
});

/* -------------------- DASHBOARD -------------------- */
router.get("/", auth, (req, res) => {
    res.render("admin/dashboard");
});

/* -------------------- CATEGORY ROUTES -------------------- */
router.get("/add-category", auth, (req, res) => {
    res.render("admin/add-category");
});

router.post("/add-category", auth, async (req, res) => {
    const { name } = req.body;
    await Category.create(name);
    res.redirect("/admin/categories");
});

router.get("/categories", auth, async (req, res) => {
    const categories = await Category.getAll();
    res.render("admin/categories", { categories });
});

/* -------------------- PRODUCTS -------------------- */
router.get("/add-product", auth, async (req, res) => {
    const categories = await Category.getAll();
    res.render("admin/add-product", { categories });
});

router.post("/add-product", auth, upload.single("image"), async (req, res) => {
    const { name, price, category_id, description } = req.body;
    const image = req.file ? "/uploads/" + req.file.filename : null;

    await Product.create({ name, price, category_id, image, description });
    res.redirect("/admin/products");
});

router.get("/products", auth, async (req, res) => {
    const products = await Product.getAll();
    res.render("admin/products", { products });
});

/* -------------------- EDIT PRODUCT -------------------- */
router.get("/products/edit/:id", auth, async (req, res) => {
    const product = await Product.getById(req.params.id);
    const categories = await Category.getAll();
    res.render("admin/editProduct", { product, categories });
});

router.post("/products/edit/:id", auth, upload.single("image"), async (req, res) => {
    const { name, price, category_id, description } = req.body;

    let image = req.body.oldImage;                // keep old image if none uploaded
    if (req.file) image = "/uploads/" + req.file.filename;

    await Product.update(req.params.id, { name, price, category_id, image, description });
    res.redirect("/admin/products");
});


/* -------------------- ORDERS -------------------- */
router.get("/orders", auth, async (req, res) => {
    const orders = await Order.getAll();
    res.render("admin/orders", { orders });
});

export default router;

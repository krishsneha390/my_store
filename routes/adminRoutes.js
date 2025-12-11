import express from "express";
import Product from "../models/productModel.js";
import Order from "../models/orderModel.js";
import Category from "../models/categoryModel.js";
import Admin from "../models/adminModel.js";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
import adminAuth from "../middleware/adminAuth.js";


const router = express.Router();
router.use(adminAuth)
/*----------------------------------------------------------
   🔐 AUTH MIDDLEWARE
-----------------------------------------------------------*/
function auth(req, res, next) {
    if (!req.session.admin) return res.redirect("/admin/login");
    next();
}

/*----------------------------------------------------------
   📁 MULTER — IMAGE UPLOAD
-----------------------------------------------------------*/
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "public/uploads"),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

/*----------------------------------------------------------
   🔑 LOGIN / LOGOUT
-----------------------------------------------------------*/
router.get("/login", (req, res) => res.render("admin/login"));

router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const admin = await Admin.findByUser(username);

    if (!admin) return res.send("❌ User not found");
    if (!await bcrypt.compare(password, admin.password))
        return res.send("❌ Wrong password");

    req.session.admin = admin;
    res.redirect("/admin");
});

router.get("/logout", (req, res) => req.session.destroy(() => res.redirect("/admin/login")));

/*----------------------------------------------------------
   🏠 DASHBOARD
-----------------------------------------------------------*/
router.get("/", auth, (req, res) => res.render("admin/dashboard"));

/*----------------------------------------------------------
   📂 CATEGORIES (FULL CRUD) — FINAL WORKING
-----------------------------------------------------------*/

// Show category list
router.get("/categories", auth, async (req, res) => {
    res.render("admin/categories", { categories: await Category.getAll() });
});

// Add category page
router.get("/categories/add", auth, (req, res) => {
    res.render("admin/add-category");
});

// Add category submit
router.post("/categories/add", auth, async (req, res) => {
    await Category.create(req.body.name);
    res.redirect("/admin/categories");
});

// Edit page
router.get("/categories/edit/:id", auth, async (req, res) => {
    res.render("admin/edit-category", {
        category: await Category.getById(req.params.id)
    });
});

// Update submit
router.post("/categories/edit/:id", auth, async (req, res) => {
    await Category.update(req.params.id, req.body.name);
    res.redirect("/admin/categories");
});

// Delete category (FIXED)
router.post("/categories/delete/:id", auth, async (req, res) => {
    await Category.delete(req.params.id);
    res.redirect("/admin/categories");
});


/*----------------------------------------------------------
   🛍 PRODUCT MANAGEMENT
-----------------------------------------------------------*/
router.get("/add-product", auth, async (req, res) => {
    res.render("admin/add-product", { categories: await Category.getAll() });
});

router.post("/add-product", auth, upload.single("image"), async (req, res) => {
    const image = req.file ? "/uploads/" + req.file.filename : null;
    await Product.create({ ...req.body, image });
    res.redirect("/admin/products");
});

router.get("/products", auth, async (req, res) => {
    res.render("admin/products", { products: await Product.getAll() });
});

router.get("/products/edit/:id", auth, async (req, res) => {
    res.render("admin/editProduct", {
        product: await Product.getById(req.params.id),
        categories: await Category.getAll()
    });
});

router.post("/products/edit/:id", auth, upload.single("image"), async (req, res) => {
    let image = req.body.oldImage;
    if (req.file) image = "/uploads/" + req.file.filename;

    await Product.update(req.params.id, { ...req.body, image });
    res.redirect("/admin/products");
});

/*----------------------------------------------------------
   🔥 MASS EDIT + PAGINATION
-----------------------------------------------------------*/
router.get("/mass-edit", auth, async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = 30;
    const offset = (page - 1) * limit;

    const { products, total } = await Product.getPaginated(limit, offset);
    const totalPages = Math.ceil(total / limit);

    res.render("admin/mass-edit", {
        products,
        categories: await Category.getAll(),
        page,
        totalPages
    });
});

/*----------------------------------------------------------
   📦 ORDERS
-----------------------------------------------------------*/
router.get("/orders", auth, async (req, res) => {
    res.render("admin/orders", { orders: await Order.getAll() });
});

router.post("/orders/delete/:id", auth, async (req, res) => {
    await Order.delete(req.params.id);
    res.redirect("/admin/orders");
});

export default router;

import express from "express";
import Product from "../models/productModel.js";
import Order from "../models/orderModel.js";
import Category from "../models/categoryModel.js";

const router = express.Router();

// -------------------- Dashboard --------------------
router.get("/admin", (req, res) => res.render("admin/dashboard"));

// -------------------- CATEGORY ROUTES --------------------
router.get("/admin/add-category", (req, res) => {
    res.render("admin/add-category");
});

router.post("/admin/add-category", async (req, res) => {
    const { name } = req.body;
    await Category.create(name);
    res.redirect("/admin/categories");
});

router.get("/admin/categories", async (req, res) => {
    const categories = await Category.getAll();
    res.render("admin/categories", { categories });
});

// -------------------- PRODUCT ROUTES --------------------
router.get("/admin/add-product", async (req, res) => {
    const categories = await Category.getAll(); // show dropdown
    res.render("admin/add-product", { categories });
});

router.post("/admin/add-product", async (req, res) => {
    const { name, price, category_id, image, description } = req.body;
    await Product.create({ name, price, category_id, image, description });
    res.redirect("/admin/products");
});

router.get("/admin/products", async (req, res) => {
    const products = await Product.getAll();
    res.render("admin/products", { products });
});

// -------------------- ORDERS --------------------
router.get("/admin/orders", async (req, res) => {
    const orders = await Order.getAll();
    res.render("admin/orders", { orders });
});

export default router;

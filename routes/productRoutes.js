import express from "express";
import Product from "../models/productModel.js";
import Order from "../models/orderModel.js";

const router = express.Router();

// ================== CART STORAGE ==================
let cart = [];   // <--- exists only once here
// ==================================================

// Show all products on homepage
router.get("/", async (req, res) => {
    const products = await Product.getAll();
    res.render("shop/home", { products });
});

// Product details page
router.get("/product/:id", async (req, res) => {
    const product = await Product.getById(req.params.id);
    res.render("shop/product-detail", { product });
});

// Add to cart (with quantity support)
router.post("/add-to-cart/:id", async (req, res) => {
    const product = await Product.getById(req.params.id);

    const exists = cart.find(item => item.id == product.id);

    if (exists) {
        exists.qty += 1;
    } else {
        cart.push({ ...product, qty: 1 });
    }

    res.redirect("/cart");
});

// View cart
router.get("/cart", (req, res) => {
    let total = cart.reduce((sum, p) => sum + p.price * p.qty, 0);
    res.render("shop/cart", { cart, total });
});

// Remove item
router.get("/cart/remove/:id", (req, res) => {
    cart = cart.filter(item => item.id != req.params.id);
    res.redirect("/cart");
});

// Clear entire cart
router.get("/cart/clear", (req, res) => {
    cart = [];
    res.redirect("/cart");
});

// Checkout page
router.get("/checkout", (req, res) => {
    let total = cart.reduce((sum, p) => sum + p.price * p.qty, 0);
    res.render("shop/checkout", { cart, total });
});

// Submit order
router.post("/checkout", async (req, res) => {
    const { name, phone, address } = req.body;
    let total = cart.reduce((sum, p) => sum + p.price * p.qty, 0);

    await Order.create({ 
        name, phone, address, 
        items: cart, 
        total 
    });

    cart = []; // empty cart after order
    res.redirect("/order-success");
});


// Place order
router.post("/checkout", async (req, res) => {
    let total = cart.reduce((sum, p) => sum + (p.price * p.qty), 0);

    await Order.create({ items: cart, total });

    cart = []; // Clear cart after order
    res.redirect("/order-success");
});

router.get("/order-success", (req, res) => res.render("shop/order-success"));

export default router;

const express = require("express");
const router = express.Router();
const Product = require("../models/productModel");
const Order = require("../models/orderModel");

let cart = [];   // Temporary cart (later we add sessions or DB cart)

// Home Page
router.get("/", async (req, res) => {
    const products = await Product.getAll();
    res.render("shop/home", { products });
});

// Product Detail View
router.get("/product/:id", async (req, res) => {
    const product = await Product.getById(req.params.id);
    res.render("shop/product-detail", { product });
});

// Add to Cart
router.post("/add-to-cart/:id", async (req, res) => {
    const product = await Product.getById(req.params.id);
    cart.push(product);
    res.redirect("/cart");
});

// View Cart Page
router.get("/cart", (req, res) => {
    let total = cart.reduce((sum,p)=> sum + Number(p.price),0);
    res.render("shop/cart", { cart, total });
});

// Checkout Page
router.get("/checkout", (req, res) => {
    let total = cart.reduce((sum,p)=> sum + Number(p.price),0);
    res.render("shop/checkout", { cart, total });
});

// Place Order
router.post("/checkout", async (req, res) => {
    let total = cart.reduce((sum,p)=> sum + Number(p.price),0);

    await Order.create({ items: cart, total });

    cart = []; // Clear cart after order
    res.redirect("/order-success");
});

// Order Success Page
router.get("/order-success", (req, res) => {
    res.render("shop/order-success");
});

module.exports = router;

import express from "express";
import Product from "../models/productModel.js";
import Order from "../models/orderModel.js";

const router = express.Router();

// Init cart if not exists
router.use((req,res,next)=>{
    if(!req.session.cart) req.session.cart = [];
    next();
});

// 🏠 Home page
router.get("/", async (req, res) => {
    const products = await Product.getAll();
    res.render("shop/home", { products });
});

// 📄 Product detail
router.get("/product/:id", async (req, res) => {
    const product = await Product.getById(req.params.id);
    res.render("shop/product-detail", { product });
});

// ➕ Add to cart
router.post("/add-to-cart/:id", async (req, res) => {
    const product = await Product.getById(req.params.id);
    req.session.cart.push(product);
    res.redirect("/cart");
});

// 🛒 Cart page
router.get("/cart", (req,res)=>{
    const cart = req.session.cart;
    const total = cart.reduce((sum,p)=> sum + Number(p.price),0);
    res.render("shop/cart", { cart, total });
});

// 💳 Checkout
router.get("/checkout",(req,res)=>{
    const cart = req.session.cart;
    const total = cart.reduce((sum,p)=> sum + Number(p.price),0);
    res.render("shop/checkout", { cart, total });
});

// 📦 Place Order — FIX JSON ERROR HERE
router.post("/checkout", async (req,res)=>{
    const cart = req.session.cart;
    const total = cart.reduce((sum,p)=> sum + Number(p.price),0);

    await Order.create({
        items: JSON.stringify(cart), // <-- FIXED
        total
    });

    req.session.cart = [];
    res.redirect("/order-success");
});

router.get("/order-success",(req,res)=>{
    res.render("shop/order-success");
});

export default router;

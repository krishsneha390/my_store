import express from "express";
import Product from "../models/productModel.js";
import Order from "../models/orderModel.js";

const router = express.Router();

// Temporary cart (later we move to session/db)
let cart = [];


/* ===================== HOME + PAGINATION + SEARCH ===================== */

router.get("/", async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;
    const search = req.query.search || "";

    const { products, total } = await Product.getPaginated(limit, offset, search);
    const totalPages = Math.ceil(total / limit);

    res.render("shop/home", { products, page, totalPages, search });
});


/* ===================== PRODUCT DETAIL ===================== */

router.get("/product/:id", async (req, res) => {
    const product = await Product.getById(req.params.id);
    if (!product) return res.send("Product not found");

    res.render("shop/product-detail", { product });
});


/* ===================== CART ===================== */

// Add to cart
router.post("/add-to-cart/:id", async (req, res) => {
    const product = await Product.getById(req.params.id);
    if (product) cart.push(product);

    res.redirect("/cart");
});

// View cart
router.get("/cart", (req, res) => {
    let total = cart.reduce((sum,p)=> sum + Number(p.price), 0);
    res.render("shop/cart", { cart, total });
});


/* ===================== CHECKOUT ===================== */

router.get("/checkout", (req, res) => {
    let total = cart.reduce((sum,p)=> sum + Number(p.price), 0);
    res.render("shop/checkout", { cart, total });
});

router.post("/checkout", async (req, res) => {
    const { customer_name, customer_phone, customer_address } = req.body;

    let total = cart.reduce((sum,p)=> sum + Number(p.price), 0);

    await Order.create({
        customer_name,
        customer_phone,
        customer_address,
        items: cart,
        total
    });

    cart = [];  // clear cart
    res.redirect("/order-success");
});



/* ===================== ORDER PLACED ===================== */

router.get("/order-success", (req,res)=>{
    res.render("shop/order-success");
});

export default router;

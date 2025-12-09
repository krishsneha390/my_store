import express from "express";
import Product from "../models/productModel.js";
import Order from "../models/orderModel.js";

const router = express.Router();

// ================== CART MEMORY ==================
let cart = [];   // later we upgrade to session cart

// ================== HOME ==================
router.get("/", async (req, res) => {
    const products = await Product.getAll();
    res.render("shop/home", { products });
});

// ================== PRODUCT DETAILS ==================
router.get("/product/:id", async (req, res) => {
    const product = await Product.getById(req.params.id);
    res.render("shop/product-detail", { product });
});

// ================== ADD TO CART ==================
router.post("/add-to-cart/:id", async (req, res) => {
    const product = await Product.getById(req.params.id);

    const exists = cart.find(p => p.id == product.id);
    if (exists) exists.qty += 1;
    else cart.push({ ...product, qty: 1 });

    res.redirect("/cart");
});

// ================== VIEW CART ==================
router.get("/cart", (req, res) => {
    let total = cart.reduce((sum, p) => sum + p.price * p.qty, 0);
    res.render("shop/cart", { cart, total });
});

// Remove item
router.get("/cart/remove/:id", (req, res) => {
    cart = cart.filter(p => p.id != req.params.id);
    res.redirect("/cart");
});

// Clear cart
router.get("/cart/clear", (req, res) => {
    cart = [];
    res.redirect("/cart");
});
// ================== CHECKOUT PAGE (GET) ==================
router.get("/checkout", (req, res) => {
    let total = cart.reduce((sum, p) => sum + Number(p.price) * p.qty, 0);
    res.render("shop/checkout", { total });
});

// ================== CHECKOUT PAGE ==================
// ================== CHECKOUT PAGE SUBMIT ==================
router.post("/checkout", async (req, res) => {
    try {
        const { name, phone, address } = req.body;
        let total = cart.reduce((sum, p) => sum + Number(p.price) * p.qty, 0);

        await Order.create({
            customer_name: name,
            customer_phone: phone,
            customer_address: address,
            items: JSON.stringify(cart),
            total,
            payment_method: "COD",
            status: "Pending"
        });

        cart = []; 
        res.redirect("/payment-success");
    } catch (err) {
        console.log("ORDER ERROR:", err);
        res.send("❌ Checkout failed — see terminal");
    }
});



// ================== eSewa PAY ==================
router.post("/pay-esewa", (req, res) => {
    let total = cart.reduce((sum, p) => sum + Number(p.price) * p.qty, 0);

    // ---------------- Choose ONE ----------------
    const esewaURL = "https://esewa.com.np/epay/main"; // LIVE reliable
    // const esewaURL = "https://uat.esewa.com.np/epay/main"; // Test server (not reliable for Nepal sometimes)

    const paymentData = {
        amt: total,
        psc: 0,
        pdc: 0,
        txAmt: 0,
        tAmt: total,
        pid: "ORDER_" + Date.now(),

        // IMPORTANT — Replace with your merchant code
        scd: "YOUR_LIVE_MERCHANT_CODE",

        su: `${req.protocol}://${req.get("host")}/esewa-success`,
        fu: `${req.protocol}://${req.get("host")}/esewa-failed`,
        esewaURL
    };

    res.render("shop/esewa-redirect", { paymentData });
});

// ================== PAYMENT CALLBACKS ==================
router.get("/esewa-success", (req, res) => res.redirect("/payment-success"));
router.get("/esewa-failed", (req, res) => res.redirect("/payment-failed"));

// ================== RESULT PAGES ==================
router.get("/payment-success", (req, res) => res.render("shop/payment-success"));
router.get("/payment-failed", (req, res) => res.render("shop/payment-failed"));
router.get("/order-success", (req, res) => res.render("shop/order-success"));

export default router;

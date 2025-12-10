import express from "express";
import fetch from "node-fetch";
import db from "../config/db.js";

const router = express.Router();

// ===================== YOUR SHOP LOCATION (Hidden) =====================
const SOURCE_LAT = 27.7021137;
const SOURCE_LNG = 85.3120015;

// ===================== DELIVERY RATE (You can change anytime) ==========
const FARE_RATES = {
    pathao: 45,   // per km rate NPR
    indrive: 40,
    yango: 42
};

// ===================== Distance Formula (Haversine) =====================
function calcDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // km
    const dLat = (lat2-lat1) * Math.PI/180;
    const dLon = (lon2-lon1) * Math.PI/180;
    const a = Math.sin(dLat/2)**2 +
              Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) *
              Math.sin(dLon/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}


// ===================== CART PAGE =====================
router.get("/cart", async (req,res)=>{
    const cart = req.session.cart || {items:[], total:0};
    res.render("shop/cart", {cart});
});


// ===================== CHECKOUT FORM =====================
router.get("/checkout", async (req,res)=>{
    const cart = req.session.cart;
    if(!cart || cart.total === 0) return res.send("Cart empty");

    res.render("shop/checkout");  // Form page
});


// ===================== DELIVERY CALCULATION =====================
router.post("/checkout/calculate", async (req,res)=>{
    const {address, delivery_method} = req.body;

    try{
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
        const geo = await fetch(url).then(r=>r.json());

        if(!geo.length) return res.send("❌ Invalid address");

        const D_LAT = parseFloat(geo[0].lat);
        const D_LNG = parseFloat(geo[0].lon);

        const distance = calcDistance(SOURCE_LAT, SOURCE_LNG, D_LAT, D_LNG);

        const fare = Math.round(distance * FARE_RATES[delivery_method]);

        req.session.delivery = {
            address,
            method: delivery_method,
            distance: distance.toFixed(2),
            fare
        };

        res.redirect("/checkout/summary");

    }catch(err){
        console.log(err);
        res.send("Delivery calculation failed");
    }
});


// ===================== SUMMARY PAGE =====================
router.get("/checkout/summary", async (req,res)=>{
    const cart = req.session.cart;
    const delivery = req.session.delivery;

    if(!cart || !delivery) return res.redirect("/checkout");

    const total_pay = cart.total + delivery.fare;

    res.render("shop/checkout-summary", {cart, delivery, total_pay});
});

export default router;

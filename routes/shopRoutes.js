import express from "express";
import Product from "../models/productModel.js";
import Order from "../models/orderModel.js";
import fetch from "node-fetch";

const router = express.Router();

/*============================ HOME ============================*/
router.get("/", async (req,res)=>{
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page-1)*limit;
    const search = req.query.search || "";

    const { products,total } = await Product.getPaginated(limit,offset,search);
    const totalPages = Math.ceil(total/limit);

    res.render("shop/home",{ products,page,totalPages,search });
});

/*====================== PRODUCT PAGE =========================*/
router.get("/product/:id", async(req,res)=>{
    const product = await Product.getById(req.params.id);
    if(!product) return res.send("Product not found");
    res.render("shop/product-detail",{ product });
});

/*========================== ADD TO CART =============================*/
router.post("/add-to-cart/:id", async (req, res) => {
    const product = await Product.getById(req.params.id);
    if (!product) return res.redirect("/");

    if (!req.session.cart) req.session.cart = [];

    // check if product exists already
    const index = req.session.cart.findIndex(p => p.id === product.id);

    if (index !== -1) {
        req.session.cart[index].qty += 1;
    } else {
        req.session.cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            qty: 1
        });
    }

    res.redirect("/cart");
});

/*========================== CART PAGE =============================*/
router.get("/cart", (req, res) => {
    const cart = req.session.cart || [];

    let total = cart.reduce((sum, p) => sum + (p.price * p.qty), 0);

    res.render("shop/cart", { cart, total });
});

/*======================== UPDATE CART ===========================*/

// Increase qty
router.post("/cart/increase/:id", (req,res)=>{
    const cart = req.session.cart || [];
    const i = cart.findIndex(p => p.id == req.params.id);

    if (i !== -1) cart[i].qty++;

    req.session.cart = cart;
    res.redirect("/cart");
});

// Decrease qty
router.post("/cart/decrease/:id", (req,res)=>{
    const cart = req.session.cart || [];
    const i = cart.findIndex(p => p.id == req.params.id);

    if (i !== -1 && cart[i].qty > 1) cart[i].qty--;

    req.session.cart = cart;
    res.redirect("/cart");
});

// Delete item
router.post("/cart/delete/:id", (req,res)=>{
    let cart = req.session.cart || [];

    cart = cart.filter(p => p.id != req.params.id);

    req.session.cart = cart;
    res.redirect("/cart");
});

/*================ STORE LOCATION ============================*/
const SOURCE_LAT = 27.7021137;
const SOURCE_LNG = 85.3120015;

/*========== REAL DRIVING DISTANCE USING OSRM API ============*/
async function getDrivingDistance(lat, lng) {
    const url = `http://router.project-osrm.org/route/v1/driving/${SOURCE_LNG},${SOURCE_LAT};${lng},${lat}?overview=false`;

    let data = null;

    try {
        data = await fetch(url).then(r => r.json());
    } catch (err) {
        data = null;
    }

    // ⚠️ OSRM FAILED → fallback to Haversine
    if (!data || !data.routes || !data.routes.length) {
        const R = 6371;
        const dLat = (lat - SOURCE_LAT) * Math.PI / 180;
        const dLon = (lng - SOURCE_LNG) * Math.PI / 180;

        const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(SOURCE_LAT * Math.PI / 180) *
            Math.cos(lat * Math.PI / 180) *
            Math.sin(dLon / 2) ** 2;

        const haversineDistance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Number(haversineDistance.toFixed(2));
    }

    // OSRM succeeded
    return Number((data.routes[0].distance / 1000).toFixed(2));
}


/*====================== CHECKOUT PAGE ========================*/
router.get("/checkout",(req,res)=>{
    const cart = req.session.cart || [];
    let total = cart.reduce((x,p)=>x+(p.price * p.qty),0);

    res.render("shop/checkout",{ cart,total });
});

/*========== CALCULATE DELIVERY + STORE IN SESSION ===========*/
router.post("/checkout/calculate", async(req,res)=>{

    const { customer_name,customer_phone,customer_address,
            delivery_method,location_source,lat,lng } = req.body;

    const cart = req.session.cart || [];
    let total = cart.reduce((x,p)=>x+(p.price * p.qty),0);

    let userLat=null,userLng=null;

    if(location_source==="gps" && lat && lng){
        userLat=parseFloat(lat);
        userLng=parseFloat(lng);

    } else if(location_source==="address" && customer_address){
        const geo = await fetch(
           `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(customer_address)}`
        ).then(r=>r.json());

        if(!geo.length) return res.send("❌ Invalid Address");
        userLat=parseFloat(geo[0].lat);
        userLng=parseFloat(geo[0].lon);
    }
    else return res.send("❌ GPS or Address required!");

    const distance = await getDrivingDistance(userLat,userLng);
    if(!distance) return res.send("❌ Distance calculation failed");

    let fee=0;
    if(delivery_method==="pathao") fee = distance<=2?80:80+(distance-2)*25;
    if(delivery_method==="indrive") fee = distance<=2?70:70+(distance-2)*20;
    if(delivery_method==="yango")  fee = distance<=2?75:75+(distance-2)*23;

    fee = Math.round(fee);
    const grand_total = total + fee;

    req.session.checkout = {
        customer_name,
        customer_phone,
        customer_address,
        delivery_method,
        distance:Number(distance),
        delivery_fee:Number(fee),
        grand_total:Number(grand_total),
        userLat:Number(userLat),
        userLng:Number(userLng)
    };

    res.redirect("/checkout/summary");
});

/*======================= SUMMARY PAGE ========================*/
router.get("/checkout/summary",(req,res)=>{
    if(!req.session.checkout) return res.redirect("/checkout");

    res.render("shop/checkout-summary",{ 
        data:req.session.checkout, 
        cart: req.session.cart || []
    });
});

/*================ SAVE ORDER TO DATABASE =====================*/
router.post("/checkout/place-order", async(req,res)=>{

    let d = req.session.checkout;

    if(!d){
        d = {
            customer_name:req.body.customer_name,
            customer_phone:req.body.customer_phone,
            customer_address:req.body.customer_address,
            delivery_method:req.body.delivery_method,
            distance:Number(req.body.distance),
            delivery_fee:Number(req.body.fee),
            userLat:Number(req.body.lat),
            userLng:Number(req.body.lng),
            grand_total:Number(req.body.total)
        };
    }

    const cart = req.session.cart || [];

    await Order.create({
        customer_name:d.customer_name,
        customer_phone:d.customer_phone,
        customer_address:d.customer_address,

        delivery_lat:Number(d.userLat),
        delivery_lng:Number(d.userLng),
        delivery_distance:Number(d.distance),
        delivery_fee:Number(d.delivery_fee),

        items: cart,
        total:d.grand_total
    });

    req.session.cart = [];
    req.session.checkout = null;

    res.redirect("/order-success");
});

/*====================== SUCCESS PAGE ========================*/
router.get("/order-success",(req,res)=> 
    res.render("shop/order-success")
);

export default router;

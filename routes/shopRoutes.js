import express from "express";
import Product from "../models/productModel.js";
import Order from "../models/orderModel.js";
import fetch from "node-fetch";

const router = express.Router();

// Temporary Cart (later replace with DB)
let cart = [];

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

/*========================== CART =============================*/
router.post("/add-to-cart/:id", async(req,res)=>{
    const product = await Product.getById(req.params.id);
    if(product) cart.push(product);
    res.redirect("/cart");
});

router.get("/cart",(req,res)=>{
    let total = cart.reduce((x,p)=>x+Number(p.price),0);
    res.render("shop/cart",{ cart,total });
});

/*================ STORE LOCATION ============================*/
const SOURCE_LAT = 27.7021137;
const SOURCE_LNG = 85.3120015;

/*========== REAL DRIVING DISTANCE USING OSRM API ============*/
async function getDrivingDistance(lat,lng){
    const url = `http://router.project-osrm.org/route/v1/driving/${SOURCE_LNG},${SOURCE_LAT};${lng},${lat}?overview=false`;
    const data = await fetch(url).then(r=>r.json()).catch(()=>null);

    if(!data || !data.routes) return null;
    return Number((data.routes[0].distance/1000).toFixed(2)); // return km as number
}

/*====================== CHECKOUT PAGE ========================*/
router.get("/checkout",(req,res)=>{
    let total = cart.reduce((x,p)=>x+Number(p.price),0);
    res.render("shop/checkout",{ cart,total });
});

/*========== CALCULATE DELIVERY + STORE IN SESSION ===========*/
router.post("/checkout/calculate", async(req,res)=>{

    const { customer_name,customer_phone,customer_address,
            delivery_method,location_source,lat,lng } = req.body;

    let total = cart.reduce((x,p)=>x+Number(p.price),0);
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

    // Delivery Fee Rules
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

    console.log("📌 SESSION SAVED →", req.session.checkout);

    res.redirect("/checkout/summary");
});

/*======================= SUMMARY PAGE ========================*/
router.get("/checkout/summary",(req,res)=>{
    if(!req.session.checkout) return res.redirect("/checkout");
    res.render("shop/checkout-summary",{ data:req.session.checkout, cart });
});

/*================ SAVE ORDER TO DATABASE =====================*/
router.post("/checkout/place-order", async(req,res)=>{

    let d = req.session.checkout;

    // Fallback support
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
        }
    }

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


    cart=[];
    req.session.checkout=null;

    res.redirect("/order-success");
});

/*====================== SUCCESS PAGE ========================*/
router.get("/order-success",(req,res)=> res.render("shop/order-success"));

export default router;

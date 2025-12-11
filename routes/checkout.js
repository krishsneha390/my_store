import express from "express";
const router = express.Router();

// Your store coordinates
const STORE_LAT = 27.6710;
const STORE_LNG = 85.4298;

// Haversine distance
function calcDist(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI/180;
    const dLon = (lon2 - lon1) * Math.PI/180;

    const a = Math.sin(dLat/2)**2 +
        Math.cos(lat1 * Math.PI/180) *
        Math.cos(lat2 * Math.PI/180) *
        Math.sin(dLon/2)**2;

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

router.post("/calculate", (req, res) => {
    try {
        const { customer_name, customer_phone, customer_address,
                delivery_method, location_source, lat, lng } = req.body;

        let distance = 0;

        if (location_source === "gps") {
            if (!lat || !lng) {
                return res.send("❌ GPS location missing");
            }

            distance = calcDist(
                STORE_LAT,
                STORE_LNG,
                parseFloat(lat),
                parseFloat(lng)
            );
        }

        if (location_source === "address") {
            distance = 5; // default
        }

        const delivery_fee = Math.round(distance * 20);

        const grand_total = req.session.cartTotal + delivery_fee;

        res.render("shop/checkout-summary", {
            data: {
                customer_name,
                customer_phone,
                customer_address,
                delivery_method,

                userLat: lat || null,
                userLng: lng || null,

                distance: distance.toFixed(2),
                delivery_fee,
                grand_total
            }
        });

    } catch (e) {
        console.log(e);
        res.send("❌ Distance calculation failed");
    }
});

export default router;

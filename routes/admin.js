const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Load Add Product Page
router.get("/add-product", (req, res) => {
    res.render("admin/add-product");
});

// Save Product to DB
router.post("/add-product", async (req, res) => {
    try {
        const { name, price, stock, description, image } = req.body;
        const slug = name.toLowerCase().replace(/\s+/g, "-");

        await db.query(
            `INSERT INTO products (name, slug, price, stock, description, image)
             VALUES ($1, $2, $3, $4, $5, $6)`,
             [name, slug, price, stock, description, image]
        );

        res.redirect("/");
    } catch (error) {
        console.log("ERROR:", error);
        res.send("Something went wrong.");
    }
});

module.exports = router;

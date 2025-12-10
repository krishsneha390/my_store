import express from "express";
import Product from "../models/productModel.js";

const router = express.Router();

// ================= Home + Pagination + Search =================
router.get("/", async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;                         // Products per page
    const offset = (page - 1) * limit;
    const search = req.query.search || "";    // search keyword

    const { products, total } = await Product.getPaginated(limit, offset, search);
    const totalPages = Math.ceil(total / limit);

    res.render("home", {
        products,
        page,
        totalPages,
        search
    });
});

// ================= Single Product Page =================
router.get("/product/:id", async (req, res) => {
    const product = await Product.getById(req.params.id);
    res.render("product-detail", { product });
});

export default router;

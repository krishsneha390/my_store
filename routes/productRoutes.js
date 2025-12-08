const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const db = require("../config/db");

// ===== Multer: image upload config =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "public", "uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// ===== Product list (admin) =====
router.get("/", (req, res) => {
  const sql = `
    SELECT p.*, c.name AS category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    ORDER BY p.id DESC
  `;
  db.all(sql, [], (err, products) => {
    if (err) {
      console.log(err);
      return res.send("DB error on products");
    }
    res.render("admin/products", { products });
  });
});

// ===== Show add-product form =====
router.get("/add", (req, res) => {
  db.all("SELECT * FROM categories ORDER BY name", [], (err, categories) => {
    if (err) {
      console.log(err);
      return res.send("DB error on categories");
    }
    res.render("admin/add-product", { categories });
  });
});

// ===== Handle add-product submit =====
router.post("/add", upload.single("image"), (req, res) => {
  const { name, brand, price, stock, short_description, long_description, category_id } = req.body;
  const image = req.file ? req.file.filename : null;

  const sql = `
    INSERT INTO products
    (name, brand, price, stock, image, short_description, long_description, category_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [
    name,
    brand || "",
    parseFloat(price),
    parseInt(stock || "0", 10),
    image,
    short_description || "",
    long_description || "",
    parseInt(category_id, 10),
  ];

  db.run(sql, params, (err) => {
    if (err) {
      console.log(err);
      return res.send("DB error inserting product");
    }
    res.redirect("/admin/products");
  });
});

module.exports = router;

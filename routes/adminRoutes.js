const express = require("express");
const router = express.Router();
const db = require("../config/db");
const multer = require("multer");
const path = require("path");

// ===== Multer for product images =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "..", "public", "uploads")),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// ===== Dashboard =====
router.get("/", (req, res) => {
  res.render("admin/dashboard");
});

// ===== Categories =====
router.get("/categories", (req, res) => {
  db.all("SELECT * FROM categories ORDER BY id DESC", (err, rows) => {
    if (err) console.log(err);
    res.render("admin/categories", { categories: rows });
  });
});

router.get("/categories/add", (req, res) => {
  res.render("admin/add-category");
});

router.post("/categories/add", (req, res) => {
  const name = req.body.name;
  const slug = name.toLowerCase().trim().replace(/\s+/g, "-");

  db.run(
    "INSERT INTO categories(name, slug) VALUES (?, ?)",
    [name, slug],
    (err) => {
      if (err) console.log(err);
      res.redirect("/admin/categories");
    }
  );
});

// ===== Products =====
router.get("/products", (req, res) => {
  const sql = `
    SELECT p.*, c.name AS category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    ORDER BY p.id DESC
  `;
  db.all(sql, [], (err, products) => {
    if (err) console.log(err);
    res.render("admin/products", { products });
  });
});

router.get("/products/add", (req, res) => {
  db.all("SELECT * FROM categories ORDER BY name", [], (err, categories) => {
    if (err) console.log(err);
    res.render("admin/add-product", { categories });
  });
});

router.post("/products/add", upload.single("image"), (req, res) => {
  const { name, brand, price, stock, short_description, long_description, category_id } = req.body;
  const image = req.file ? req.file.filename : null;

  db.run(
    `INSERT INTO products
     (name, brand, price, stock, image, short_description, long_description, category_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      name,
      brand || "",
      parseFloat(price),
      parseInt(stock || "0", 10),
      image,
      short_description || "",
      long_description || "",
      parseInt(category_id, 10),
    ],
    (err) => {
      if (err) console.log(err);
      res.redirect("/admin/products");
    }
  );
});

// ===== Orders List =====
router.get("/orders", (req, res) => {
  db.all(`SELECT * FROM orders ORDER BY id DESC`, [], (err, orders) => {
    if (err) {
      console.log(err);
      return res.send("Error loading orders");
    }
    res.render("admin/orders", { orders });
  });
});

// ===== Order Detail =====
router.get("/orders/:id", (req, res) => {
  const id = req.params.id;

  db.get(`SELECT * FROM orders WHERE id = ?`, [id], (err, order) => {
    if (!order) return res.send("Order not found");
    db.all(`SELECT * FROM order_items WHERE order_id = ?`, [id], (err2, items) => {
      if (err2) console.log(err2);
      res.render("admin/order-detail", { order, items });
    });
  });
});

module.exports = router;

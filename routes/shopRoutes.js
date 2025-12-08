const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ===== HOME: Products + Category Filter + Search =====
router.get("/", (req, res) => {
  const selectedCategory = req.query.category || "";
  const search = req.query.q || "";

  db.all(`SELECT * FROM categories ORDER BY name`, [], (err, categories) => {
    if (err) {
      console.log(err);
      return res.send("DB error while loading categories.");
    }

    let sql = `
      SELECT p.*, c.name AS category_name, c.slug AS category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
    `;
    const params = [];
    const cond = [];

    if (selectedCategory) {
      cond.push("c.slug = ?");
      params.push(selectedCategory);
    }

    if (search) {
      cond.push("(p.name LIKE ? OR p.brand LIKE ?)");
      params.push(`%${search}%`, `%${search}%`);
    }

    if (cond.length > 0) {
      sql += " WHERE " + cond.join(" AND ");
    }

    sql += " ORDER BY p.id DESC";

    db.all(sql, params, (err2, products) => {
      if (err2) {
        console.log(err2);
        return res.send("DB error while loading products.");
      }

      res.render("shop/home", {
        categories,
        products,
        selectedCategory,
        search,
      });
    });
  });
});

// ===== PRODUCT DETAIL =====
router.get("/product/:id", (req, res) => {
  const id = req.params.id;

  db.get(`SELECT * FROM products WHERE id = ?`, [id], (err, product) => {
    if (err || !product) {
      console.log(err);
      return res.send("Product not found.");
    }

    res.render("shop/product-detail", { product });
  });
});

// ===== ADD TO CART =====
router.get("/add-to-cart/:id", (req, res) => {
  const id = req.params.id;

  db.get(`SELECT * FROM products WHERE id = ?`, [id], (err, product) => {
    if (err || !product) {
      console.log(err);
      return res.send("Product not found.");
    }

    if (!req.session.cart) req.session.cart = [];
    let cart = req.session.cart;

    let existing = cart.find((p) => p.id === product.id);

    if (existing) {
      existing.qty++;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        qty: 1,
      });
    }

    res.redirect("/cart");
  });
});

// ===== CART PAGE =====
router.get("/cart", (req, res) => {
  const cart = req.session.cart || [];
  let total = 0;
  cart.forEach((item) => {
    total += item.price * item.qty;
  });

  res.render("shop/cart", { cart, total });
});

// ===== REMOVE FROM CART =====
router.get("/cart/remove/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  let cart = req.session.cart || [];
  cart = cart.filter((item) => item.id !== id);
  req.session.cart = cart;
  res.redirect("/cart");
});

// ===== CHECKOUT PAGE =====
router.get("/checkout", (req, res) => {
  const cart = req.session.cart || [];
  if (cart.length === 0) return res.redirect("/cart");

  let total = 0;
  cart.forEach((item) => (total += item.price * item.qty));

  res.render("shop/checkout", { cart, total });
});

// ===== HANDLE CHECKOUT =====
router.post("/checkout", (req, res) => {
  const cart = req.session.cart || [];
  if (cart.length === 0) return res.redirect("/cart");

  const { name, phone, address } = req.body;

  let total = 0;
  cart.forEach((item) => (total += item.price * item.qty));

  db.run(
    `INSERT INTO orders (customer_name, phone, address, total)
     VALUES (?, ?, ?, ?)`,
    [name, phone, address, total],
    function (err) {
      if (err) {
        console.log(err);
        return res.send("Error saving order");
      }

      const orderId = this.lastID;

      const stmt = db.prepare(
        `INSERT INTO order_items (order_id, product_id, name, price, qty)
         VALUES (?, ?, ?, ?, ?)`
      );
      cart.forEach((item) => {
        stmt.run(orderId, item.id, item.name, item.price, item.qty);
      });
      stmt.finalize();

      req.session.cart = []; // clear cart

      res.render("shop/order-success", { orderId });
    }
  );
});

module.exports = router;

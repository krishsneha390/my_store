import express from "express";
import pool from "../config/db.js";

const router = express.Router();

// ===== HOME (Products + Category Filter + Search) =====
router.get("/", async (req, res) => {
  try {
    const selectedCategory = req.query.category || "";
    const search = req.query.q || "";

    const { rows: categories } = await pool.query(
      `SELECT id, name, slug FROM categories ORDER BY name`
    );

    let sql = `
      SELECT p.*, c.name AS category_name, c.slug AS category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
    `;

    const params = [];
    const cond = [];

    if (selectedCategory) {
      cond.push("c.slug = $1");
      params.push(selectedCategory);
    }

    if (search) {
      cond.push(`(p.name ILIKE $${params.length + 1} OR p.brand ILIKE $${params.length + 2})`);
      params.push(`%${search}%`, `%${search}%`);
    }

    if (cond.length) sql += " WHERE " + cond.join(" AND ");

    sql += " ORDER BY p.id DESC";

    const { rows: products } = await pool.query(sql, params);

    res.render("shop/home", { categories, products, selectedCategory, search });

  } catch (err) {
    console.log(err);
    res.send("Database error loading products.");
  }
});


// ===== PRODUCT DETAIL =====
router.get("/product/:id", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM products WHERE id=$1", [req.params.id]);

    if (rows.length === 0) return res.send("Product not found.");

    res.render("shop/product-detail", { product: rows[0] });

  } catch (err) {
    console.log(err);
    res.send("Error fetching product.");
  }
});


// ===== ADD TO CART =====
router.get("/add-to-cart/:id", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM products WHERE id=$1", [req.params.id]);
    if (rows.length === 0) return res.send("Product not found.");

    const product = rows[0];
    if (!req.session.cart) req.session.cart = [];

    let cart = req.session.cart;
    let item = cart.find(p => p.id === product.id);

    if (item) item.qty++;
    else cart.push({ id: product.id, name: product.name, price: product.price, qty: 1 });

    res.redirect("/cart");

  } catch (err) {
    res.send("Failed to add to cart.");
  }
});


// ===== CART PAGE =====
router.get("/cart", (req, res) => {
  const cart = req.session.cart || [];
  const total = cart.reduce((t, i) => t + i.price * i.qty, 0);
  res.render("shop/cart", { cart, total });
});


// ===== REMOVE FROM CART =====
router.get("/cart/remove/:id", (req, res) => {
  req.session.cart = (req.session.cart || []).filter(i => i.id != req.params.id);
  res.redirect("/cart");
});


// ===== CHECKOUT =====
router.get("/checkout", (req, res) => {
  const cart = req.session.cart || [];
  if (!cart.length) return res.redirect("/cart");
  const total = cart.reduce((t, i) => t + i.price * i.qty, 0);

  res.render("shop/checkout", { cart, total });
});

router.post("/checkout", async (req, res) => {
  const cart = req.session.cart || [];
  if (!cart.length) return res.redirect("/cart");

  const { name, phone, address } = req.body;
  const total = cart.reduce((t, i) => t + i.price * i.qty, 0);

  try {
    const order = await pool.query(
      "INSERT INTO orders(customer_name, phone, address, total) VALUES ($1,$2,$3,$4) RETURNING id",
      [name, phone, address, total]
    );
    const orderId = order.rows[0].id;

    for (let item of cart) {
      await pool.query(
        "INSERT INTO order_items(order_id, product_id, name, price, qty) VALUES ($1,$2,$3,$4,$5)",
        [orderId, item.id, item.name, item.price, item.qty]
      );
    }

    req.session.cart = [];
    res.render("shop/order-success", { orderId });

  } catch (err) {
    console.log(err);
    res.send("Order failed.");
  }
});

export default router;

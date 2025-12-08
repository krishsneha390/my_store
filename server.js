const express = require("express");
const path = require("path");
const session = require("express-session");

const app = express();
const PORT = 3000;

// Connect DB (creates store.db + tables)
require("./config/db");

// ----- Session -----
app.use(
  session({
    secret: "my_store_secret_key",
    resave: false,
    saveUninitialized: true,
  })
);

// ----- Middlewares -----
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ----- View Engine -----
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ----- Routes -----
const adminRoutes = require("./routes/adminRoutes");
const shopRoutes = require("./routes/shopRoutes");

app.use("/admin", adminRoutes);  // Admin backend
app.use("/", shopRoutes);        // Frontend shop + cart + checkout

// ----- Start Server -----
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

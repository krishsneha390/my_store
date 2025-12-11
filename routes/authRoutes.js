// routes/authRoutes.js
import express from "express";
import bcrypt from "bcrypt";
import passport from "passport";
import User from "../models/userModel.js";
import { requireLogin } from "../middleware/auth.js";

const router = express.Router();

/* ========== SIGNUP PAGE ========== */
router.get("/signup", (req, res) => {
  res.render("auth/signup");
});

/* ========== SIGNUP POST ========== */
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.send("All fields are required!");
    }

    const exists = await User.findByEmail(email);
    if (exists) {
      return res.send("Email already registered!");
    }

    const newUser = await User.create(name, email, password, "local");

    req.session.user = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    };

    res.redirect("/");
  } catch (err) {
    console.error("Signup Error:", err);
    res.send("Something went wrong during signup.");
  }
});

/* ========== LOGIN PAGE ========== */
router.get("/login", (req, res) => {
  res.render("auth/login");
});

/* ========== LOGIN POST ========== */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.send("Email and password are required!");
    }

    const user = await User.findByEmail(email);
    if (!user) return res.send("User not found!");

    if (!user.password) {
      return res.send("This account was created with Google. Use Google login.");
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.send("Incorrect password!");

    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    res.redirect("/");
  } catch (err) {
    console.error("Login Error:", err);
    res.send("Something went wrong during login.");
  }
});

/* ========== LOGOUT ========== */
router.get("/logout", (req, res, next) => {
  req.session.user = null;
  if (req.logout) {
    req.logout((err) => {
      if (err) return next(err);
      return res.redirect("/");
    });
  } else {
    res.redirect("/");
  }
});

/* ========== GOOGLE LOGIN (STEP 1) ========== */
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

/* ========== GOOGLE CALLBACK (STEP 2) ========== */
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    req.session.user = {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    };
    res.redirect("/");
  }
);

/* ========== USER ACCOUNT PAGE (REQUIRES LOGIN) ========== */
router.get("/account", requireLogin, (req, res) => {
  res.render("auth/account"); // create views/auth/account.ejs
});

export default router;

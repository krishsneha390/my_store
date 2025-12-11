import express from "express";
import bcrypt from "bcrypt";
import passport from "passport";
import User from "../models/userModel.js";

const router = express.Router();

/* ========================================================
   SIGNUP PAGE
======================================================== */
router.get("/signup", (req, res) => {
    res.render("auth/signup");
});

/* ========================================================
   SIGNUP POST
======================================================== */
router.post("/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.send("All fields are required!");
        }

        const exists = await User.findByEmail(email);
        if (exists) return res.send("Email already registered!");

        const hashed = await bcrypt.hash(password, 10);

        const newUser = await User.create(name, email, hashed);

        // Auto-login user
        req.session.user = {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email
        };

        res.redirect("/");
    } catch (err) {
        console.error("Signup Error:", err);
        res.send("Something went wrong during signup.");
    }
});

/* ========================================================
   LOGIN PAGE
======================================================== */
router.get("/login", (req, res) => {
    res.render("auth/login");
});

/* ========================================================
   LOGIN POST
======================================================== */
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.send("Email and password are required!");
        }

        const user = await User.findByEmail(email);
        if (!user) return res.send("User not found!");

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.send("Incorrect password!");

        req.session.user = {
            id: user.id,
            name: user.name,
            email: user.email
        };

        res.redirect("/");
    } catch (err) {
        console.error("Login Error:", err);
        res.send("Something went wrong during login.");
    }
});

/* ========================================================
   LOGOUT
======================================================== */
router.get("/logout", (req, res) => {
    req.session.user = null;

    if (req.logout) {
        req.logout(() => {});
    }

    res.redirect("/");
});

/* ========================================================
   ⭐ GOOGLE LOGIN ROUTES (Passport)
======================================================== */

// 1️⃣ Redirect user to Google for authentication
router.get(
    "/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

// 2️⃣ Google returns user here after login
router.get(
    "/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/login" }),
    (req, res) => {

        // Store authenticated Google user in session
        req.session.user = {
            id: req.user.id,
            name: req.user.name,
            email: req.user.email
        };

        res.redirect("/");
    }
);

export default router;

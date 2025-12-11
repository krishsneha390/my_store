// routes/accountRoutes.js
import express from "express";

const router = express.Router();

// Only logged-in users can access
function ensureAuth(req, res, next) {
  if (!req.session.user) return res.redirect("/login");
  next();
}

router.get("/account", ensureAuth, (req, res) => {
  res.render("account", { user: req.session.user });
});

export default router;

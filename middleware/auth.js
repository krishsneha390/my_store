export function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/login"); // redirect to login if not logged in
  }
  next();
}

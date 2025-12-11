export default function adminAuth(req, res, next) {
    if (!req.session.user) {
        return res.redirect("/login");
    }

    if (req.session.user.role !== "admin") {
        return res.redirect("/login");
    }

    next();
}

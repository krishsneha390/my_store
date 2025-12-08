const db = require("../config/db");

db.prepare(`
CREATE TABLE IF NOT EXISTS orders(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    items TEXT,
    customer TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
`).run();

exports.getAll = () => {
    return db.prepare("SELECT * FROM orders").all();
};

exports.create = (items, customer) => {
    return db.prepare("INSERT INTO orders (items, customer) VALUES (?,?)")
            .run(items, customer);
};

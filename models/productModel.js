const db = require("../config/db");

db.prepare(`
CREATE TABLE IF NOT EXISTS products(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    price INTEGER,
    image TEXT,
    category_id INTEGER
)
`).run();

exports.getAll = () => {
    return db.prepare("SELECT * FROM products").all();
};

exports.findById = (id) => {
    return db.prepare("SELECT * FROM products WHERE id=?").get(id);
};

exports.create = (data) => {
    return db.prepare(`
        INSERT INTO products (name, description, price, image, category_id)
        VALUES (?,?,?,?,?)
    `).run(data.name, data.description, data.price, data.image, data.category_id);
};

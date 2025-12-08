const db = require("../config/db");

db.prepare(`
CREATE TABLE IF NOT EXISTS categories(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE
)
`).run();

exports.getAll = () => {
    return db.prepare("SELECT * FROM categories").all();
};

exports.create = (name) => {
    return db.prepare("INSERT INTO categories (name) VALUES (?)").run(name);
};

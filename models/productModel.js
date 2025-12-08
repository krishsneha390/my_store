const db = require("../config/db");

const Product = {
    createTable: async () => {
        await db.query(`
            CREATE TABLE IF NOT EXISTS products (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                price NUMERIC NOT NULL,
                category_id INTEGER REFERENCES categories(id),
                image TEXT
            );
        `);
    },

    getAll: async () => {
        const { rows } = await db.query("SELECT * FROM products ORDER BY id DESC");
        return rows;
    },

    getById: async (id) => {
        const { rows } = await db.query("SELECT * FROM products WHERE id=$1", [id]);
        return rows[0];
    },

    create: async ({ name, price, category_id, image }) => {
        await db.query(
            "INSERT INTO products(name, price, category_id, image) VALUES ($1,$2,$3,$4)",
            [name, price, category_id, image]
        );
    }
};

module.exports = Product;

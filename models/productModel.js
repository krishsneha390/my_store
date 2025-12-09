import db from "../config/db.js";

const Product = {
    createTable: async () => {
        await db.query(`
            CREATE TABLE IF NOT EXISTS products (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                price NUMERIC NOT NULL,
                category_id INTEGER,
                image TEXT,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

    create: async ({ name, price, category_id, image, description }) => {
        await db.query(
            "INSERT INTO products(name, price, category_id, image, description) VALUES ($1,$2,$3,$4,$5)",
            [name, price, category_id, image, description]
        );
    }
};

export default Product;

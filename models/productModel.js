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
    },

    // 🔥 Edit product
    update: async (id, { name, price, category_id, image, description }) => {
        await db.query(
            "UPDATE products SET name=$1, price=$2, category_id=$3, image=$4, description=$5 WHERE id=$6",
            [name, price, category_id, image, description, id]
        );
    },

    // 🔍 Search products by name
    search: async (query) => {
        const { rows } = await db.query(
            "SELECT * FROM products WHERE LOWER(name) LIKE LOWER($1) ORDER BY id DESC",
            [`%${query}%`]
        );
        return rows;
    }
};

export default Product;

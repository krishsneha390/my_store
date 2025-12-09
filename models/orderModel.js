import pool from "../config/db.js";

const Order = {
    createTable: async () => {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS orders (
                id SERIAL PRIMARY KEY,
                customer_name VARCHAR(255),
                phone VARCHAR(20),
                address TEXT,
                items JSON NOT NULL,
                total NUMERIC NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
    },

    create: async ({ name, phone, address, items, total }) => {
        await pool.query(
            "INSERT INTO orders(customer_name, phone, address, items, total) VALUES ($1,$2,$3,$4,$5)",
            [name, phone, address, JSON.stringify(items), total]
        );
    },

    getAll: async () => {
        const { rows } = await pool.query("SELECT * FROM orders ORDER BY id DESC");
        return rows;
    }
};

export default Order;

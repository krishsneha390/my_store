import pool from "../config/db.js";

const Order = {

    createTable: async () => {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS orders (
                id SERIAL PRIMARY KEY,
                customer_name VARCHAR(255),
                customer_phone VARCHAR(20),
                customer_address TEXT,
                delivery_lat DOUBLE PRECISION,
                delivery_lng DOUBLE PRECISION,
                delivery_distance DOUBLE PRECISION,
                delivery_fee INTEGER,
                items JSON NOT NULL,
                total NUMERIC NOT NULL,
                payment_method VARCHAR(20) DEFAULT 'COD',
                status VARCHAR(20) DEFAULT 'Pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
    },

    create: async ({
        customer_name,
        customer_phone,
        customer_address,
        items,
        total,
        delivery_lat,
        delivery_lng,
        delivery_distance,
        delivery_fee,
        payment_method = "COD",
        status = "Pending"
    }) => {
        await pool.query(
            `INSERT INTO orders(
                customer_name, customer_phone, customer_address,
                delivery_lat, delivery_lng, delivery_distance, delivery_fee,
                items, total, payment_method, status
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
            [
                customer_name,
                customer_phone,
                customer_address,
                delivery_lat,
                delivery_lng,
                delivery_distance,
                delivery_fee,
                JSON.stringify(items),
                total,
                payment_method,
                status
            ]
        );
    },

    getAll: async () => {
        const { rows } = await pool.query("SELECT * FROM orders ORDER BY id DESC");
        return rows;
    },

    updateStatus: async (id,status)=>{
        await pool.query("UPDATE orders SET status=$1 WHERE id=$2",[status,id]);
    },

    delete: async (id)=>{
        await pool.query("DELETE FROM orders WHERE id=$1",[id]);
    }

};

export default Order;

import pool from "../config/db.js";
import bcrypt from "bcrypt";

const Admin = {
    // Create table if it doesn't exist
    createTable: async () => {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS admins (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password TEXT NOT NULL
            );
        `);
    },

    // Insert default admin if table is empty
    seedDefault: async () => {
        const { rows } = await pool.query("SELECT COUNT(*) FROM admins");
        const count = Number(rows[0].count);

        if (count === 0) {
            const hashed = await bcrypt.hash("admin123", 10); // password = admin123
            await pool.query(
                "INSERT INTO admins (username, password) VALUES ($1,$2)",
                ["admin", hashed]
            );
            console.log("✅ Default admin created (admin / admin123)");
        }
    },

    // Find admin by username
    findByUser: async (username) => {
        const { rows } = await pool.query(
            "SELECT * FROM admins WHERE username=$1",
            [username]
        );
        return rows[0];
    }
};

export default Admin;

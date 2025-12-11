import pool from "../config/db.js";
import bcrypt from "bcrypt";

const User = {

    // Create Local User (normal signup)
    createLocalUser: async (name, email, password) => {
        const hashed = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `INSERT INTO users (name, email, password, auth_type)
             VALUES ($1, $2, $3, 'local')
             RETURNING *`,
            [name, email, hashed]
        );

        return result.rows[0];
    },

    // Create Google User
    createGoogleUser: async (name, email) => {
        const result = await pool.query(
            `INSERT INTO users (name, email, password, auth_type)
             VALUES ($1, $2, NULL, 'google')
             RETURNING *`,
            [name, email]
        );

        return result.rows[0];
    },

    // Find user by email
    findByEmail: async (email) => {
        const { rows } = await pool.query(
            `SELECT * FROM users WHERE email = $1`,
            [email]
        );
        return rows[0];
    },

    // Find user by ID
    findById: async (id) => {
        const { rows } = await pool.query(
            `SELECT * FROM users WHERE id = $1`,
            [id]
        );
        return rows[0];
    }
};

export default User;

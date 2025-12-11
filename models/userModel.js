// models/userModel.js
import pool from "../config/db.js";
import bcrypt from "bcrypt";

const User = {
  // Create user (local or Google). If password is null -> skip hashing.
  create: async (name, email, password, provider = "local") => {
    const hashed = password ? await bcrypt.hash(password, 10) : null;

    const { rows } = await pool.query(
      `
      INSERT INTO users (name, email, password, provider)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
      `,
      [name, email, hashed, provider]
    );

    return rows[0];
  },

  // Find by email
  findByEmail: async (email) => {
    const { rows } = await pool.query(
      `SELECT * FROM users WHERE email = $1`,
      [email]
    );
    return rows[0];
  },

  // Find by ID
  findById: async (id) => {
    const { rows } = await pool.query(
      `SELECT * FROM users WHERE id = $1`,
      [id]
    );
    return rows[0];
  },

  // Get all users (ADMIN FEATURE)
  getAllUsers: async () => {
    const { rows } = await pool.query(
      `SELECT id, name, email, provider, role 
       FROM users ORDER BY id ASC`
    );
    return rows;
  }
};

export default User;

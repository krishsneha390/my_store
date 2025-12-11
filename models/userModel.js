// models/userModel.js
import pool from "../config/db.js";
import bcrypt from "bcrypt";

const User = {
  // Create user (local or google). If password is null, we don't hash.
  create: async (name, email, password, provider = "local") => {
    const hashed = password ? await bcrypt.hash(password, 10) : null;

    const { rows } = await pool.query(
      `
      INSERT INTO users (name, email, password)
      VALUES ($1, $2, $3)
      RETURNING *;
      `,
      [name, email, hashed]
    );

    return rows[0];
  },

  findByEmail: async (email) => {
    const { rows } = await pool.query(
      `SELECT * FROM users WHERE email = $1`,
      [email]
    );
    return rows[0];
  },

  findById: async (id) => {
    const { rows } = await pool.query(
      `SELECT * FROM users WHERE id = $1`,
      [id]
    );
    return rows[0];
  },
};

export default User;

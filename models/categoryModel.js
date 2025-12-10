import pool from "../config/db.js";

const Category = {
    createTable: async () => {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS categories (
                id SERIAL PRIMARY KEY,
                name VARCHAR(200) UNIQUE NOT NULL
            );
        `);
    },

    getAll: async () => {
        const { rows } = await pool.query("SELECT * FROM categories ORDER BY id DESC");
        return rows;
    },

    getById: async (id) => {
        const { rows } = await pool.query("SELECT * FROM categories WHERE id=$1", [id]);
        return rows[0];
    },

    create: async (name) => {
        await pool.query("INSERT INTO categories(name) VALUES($1)", [name]);
    },

    update: async (id, name) => {
        await pool.query("UPDATE categories SET name=$1 WHERE id=$2", [name, id]);
    },

    delete: async (id) => {
        await pool.query("DELETE FROM categories WHERE id=$1", [id]);
    },
};

export default Category;

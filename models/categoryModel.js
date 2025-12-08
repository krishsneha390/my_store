const db = require("../config/db");

const Category = {
    createTable: async () => {
        await db.query(`
            CREATE TABLE IF NOT EXISTS categories (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL
            );
        `);
    },

    getAll: async () => {
        const { rows } = await db.query("SELECT * FROM categories ORDER BY id DESC");
        return rows;
    },

    create: async (name) => {
        await db.query("INSERT INTO categories (name) VALUES ($1)", [name]);
    }
};

module.exports = Category;

import db from "../config/db.js";

const Category = {
    create: async (name) => {
        await db.query("INSERT INTO categories(name) VALUES($1)", [name]);
    },

    getAll: async () => {
        const { rows } = await db.query("SELECT * FROM categories ORDER BY id DESC");
        return rows;
    }
};

export default Category;

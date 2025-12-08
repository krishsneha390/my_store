const Database = require("better-sqlite3");
const db = new Database("./store.db"); // local DB file

module.exports = db;

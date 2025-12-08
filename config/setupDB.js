const pool = require("./config/db");
const fs = require("fs");

const sql = fs.readFileSync("./config/init.sql").toString();

pool.query(sql)
.then(() => { console.log("Database tables created ✔"); process.exit(); })
.catch(err => console.log(err));

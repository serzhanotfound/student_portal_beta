const mysql = require("mysql2/promise");

const pool = mysql.createPool({
    host: "127.0.1.16",
    user: "root",
    password: "",
    database: "db_01",
    port: 3306
});

module.exports = pool;
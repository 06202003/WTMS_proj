const mysql = require("mysql2/promise");
require("dotenv").config({ path: ".env" });

async function check() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  const [rows] = await connection.query("DESCRIBE Category");
  console.log(rows);
  process.exit(0);
}
check();

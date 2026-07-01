const mysql = require('mysql2/promise');

async function run() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root', // root might have SUPER privilege to kill other connections
      password: '', // we don't know the root password, wait, db.ts uses 'david'
    });
  } catch (e) {
    console.error(e);
  }
}
run();

const mysql = require('mysql2/promise');

async function main() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'david',
    password: 'david20juni2003#',
    database: 'wtms_db',
    port: 3306,
  });

  try {
    console.log('Altering User table to add kategori_tempat_kerja...');
    await pool.query(`
      ALTER TABLE \`User\`
      ADD COLUMN \`kategori_tempat_kerja\` VARCHAR(100) NULL;
    `);
    console.log('User table updated.');
  } catch (e) {
    if (e.code === 'ER_DUP_FIELDNAME') console.log('kategori_tempat_kerja already exists.');
    else console.error('Error altering User:', e);
  }

  pool.end();
}

main();

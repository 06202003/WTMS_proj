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
    console.log('Altering User table...');
    await pool.query(`
      ALTER TABLE \`User\`
      ADD COLUMN \`profesi\` VARCHAR(100) NULL,
      ADD COLUMN \`spesialisasi\` VARCHAR(255) NULL,
      ADD COLUMN \`tempat_kerja\` VARCHAR(255) NULL,
      ADD COLUMN \`instagram\` VARCHAR(100) NULL,
      ADD COLUMN \`bukti_profesi\` VARCHAR(255) NULL;
    `);
    console.log('User table updated.');
  } catch (e) {
    if (e.code === 'ER_DUP_FIELDNAME') console.log('User fields already exist.');
    else console.error('Error altering User:', e);
  }

  try {
    console.log('Altering CheckIn table...');
    await pool.query(`
      ALTER TABLE \`CheckIn\`
      ADD COLUMN \`p1_checked_in_at\` DATETIME NULL,
      ADD COLUMN \`p2_checked_in_at\` DATETIME NULL,
      ADD COLUMN \`p1_jersey_taken_by\` ENUM('P1', 'P2') NULL,
      ADD COLUMN \`p2_jersey_taken_by\` ENUM('P1', 'P2') NULL;
    `);
    console.log('CheckIn table updated.');
  } catch (e) {
    if (e.code === 'ER_DUP_FIELDNAME') console.log('CheckIn fields already exist.');
    else console.error('Error altering CheckIn:', e);
  }

  pool.end();
}

main();

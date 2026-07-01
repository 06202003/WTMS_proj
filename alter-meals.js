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
    console.log('Creating Meal table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`Meal\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`tournament_id\` INT NOT NULL,
        \`name\` VARCHAR(255) NOT NULL,
        \`description\` TEXT,
        \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (\`tournament_id\`) REFERENCES \`Tournament\`(\`id\`) ON DELETE CASCADE
      );
    `);
    console.log('Meal table created.');
  } catch (e) {
    console.error('Error creating Meal table:', e);
  }

  try {
    console.log('Altering CheckIn table...');
    await pool.query(`
      ALTER TABLE \`CheckIn\`
      ADD COLUMN \`meal_taken\` BOOLEAN DEFAULT 0;
    `);
    console.log('CheckIn table updated.');
  } catch (e) {
    if (e.code === 'ER_DUP_FIELDNAME') console.log('CheckIn meal_taken field already exists.');
    else console.error('Error altering CheckIn:', e);
  }

  pool.end();
}

main();

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
    console.log('Creating PadelGroup table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`PadelGroup\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`category_id\` INT NOT NULL,
        \`name\` VARCHAR(100) NOT NULL,
        \`stage\` VARCHAR(50) NOT NULL DEFAULT 'ROUND_ROBIN',
        \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (\`category_id\`) REFERENCES \`Category\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('PadelGroup created.');
  } catch (e) {
    console.error('Error creating PadelGroup:', e);
  }

  try {
    console.log('Creating GroupTeam table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`GroupTeam\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`group_id\` INT NOT NULL,
        \`registration_id\` INT NOT NULL,
        \`points\` INT DEFAULT 0,
        \`games_won\` INT DEFAULT 0,
        \`games_lost\` INT DEFAULT 0,
        \`matches_played\` INT DEFAULT 0,
        \`rank\` INT DEFAULT 0,
        FOREIGN KEY (\`group_id\`) REFERENCES \`PadelGroup\`(\`id\`) ON DELETE CASCADE,
        FOREIGN KEY (\`registration_id\`) REFERENCES \`Registration\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('GroupTeam created.');
  } catch (e) {
    console.error('Error creating GroupTeam:', e);
  }

  try {
    console.log('Creating PadelMatch table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`PadelMatch\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`group_id\` INT NOT NULL,
        \`team1_id\` INT NULL,
        \`team2_id\` INT NULL,
        \`team1_score\` INT DEFAULT 0,
        \`team2_score\` INT DEFAULT 0,
        \`status\` VARCHAR(50) DEFAULT 'SCHEDULED',
        \`round\` INT DEFAULT 1,
        \`next_match_id\` INT NULL,
        FOREIGN KEY (\`group_id\`) REFERENCES \`PadelGroup\`(\`id\`) ON DELETE CASCADE,
        FOREIGN KEY (\`team1_id\`) REFERENCES \`Registration\`(\`id\`) ON DELETE SET NULL,
        FOREIGN KEY (\`team2_id\`) REFERENCES \`Registration\`(\`id\`) ON DELETE SET NULL,
        FOREIGN KEY (\`next_match_id\`) REFERENCES \`PadelMatch\`(\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('PadelMatch created.');
  } catch (e) {
    console.error('Error creating PadelMatch:', e);
  }

  pool.end();
}

main();

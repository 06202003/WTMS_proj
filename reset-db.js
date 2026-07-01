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
    console.log('Starting Database Reset for Transactions...');

    // We must delete in reverse dependency order or disable foreign keys
    await pool.query('SET FOREIGN_KEY_CHECKS = 0');

    // 1. Delete CheckIn records
    console.log('Deleting CheckIn records...');
    await pool.query('DELETE FROM CheckIn');

    // 2. Delete PadelMatch records
    console.log('Deleting PadelMatch records...');
    await pool.query('DELETE FROM PadelMatch');

    // 3. Delete GroupTeam records
    console.log('Deleting GroupTeam records...');
    await pool.query('DELETE FROM GroupTeam');

    // 4. Delete PadelGroup records
    console.log('Deleting PadelGroup records...');
    await pool.query('DELETE FROM PadelGroup');

    // 5. Delete Registration records
    console.log('Deleting Registration records...');
    await pool.query('DELETE FROM Registration');

    await pool.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('====================================');
    console.log('Database Reset Successful!');
    console.log('All transaction data (Registrations, Brackets, CheckIns) have been wiped.');
    console.log('Master data (Users, Tournaments, Categories, Branches, Meals) remain intact.');
    console.log('====================================');
    
  } catch (e) {
    console.error('Error during database reset:', e);
  } finally {
    pool.end();
  }
}

main();

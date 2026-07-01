const { createPool } = require('mysql2/promise');

async function main() {
  const connection = await createPool({
    uri: 'mysql://david:david20juni2003%23@localhost:3306/wtms_db',
  });
  
  try {
    const [rows] = await connection.execute('SELECT * FROM Category WHERE tournament_id = 6');
    console.log("Categories for tournament 6:", rows);
    
    // Also, just list all categories to see if there is a mismatch
    const [allRows] = await connection.execute('SELECT id, name, tournament_id FROM Category');
    console.log("All Categories:", allRows);

    // Also list tournaments
    const [tournaments] = await connection.execute('SELECT id, name FROM Tournament');
    console.log("All Tournaments:", tournaments);
  } catch (e) {
    console.error(e.message);
  } finally {
    process.exit(0);
  }
}
main();

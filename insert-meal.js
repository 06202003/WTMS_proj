const mysql = require('mysql2/promise');

async function run() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'david',
    password: 'david20juni2003#',
    database: 'wtms_db'
  });

  const [tournaments] = await connection.execute('SELECT id FROM Tournament LIMIT 1');
  if (tournaments.length > 0) {
    const tournamentId = tournaments[0].id;
    await connection.execute(
      'INSERT INTO Meal (tournament_id, name, description) VALUES (?, ?, ?)',
      [tournamentId, 'Nasi Kotak Ayam Bakar', 'Dummy meal generated for testing']
    );
    console.log('Dummy meal inserted for tournament ID:', tournamentId);
  } else {
    console.log('No tournament found to attach meal to.');
  }

  await connection.end();
}

run();

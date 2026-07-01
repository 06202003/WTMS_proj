const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./dev.db');

db.serialize(() => {
  // Clear data
  db.run("DELETE FROM User");
  db.run("DELETE FROM Tournament");
  
  console.log("Seeding dummy data into SQLite directly...");
  
  // Insert Admin
  db.run(`INSERT INTO User (id, nama_lengkap, email, no_whatsapp, password_hash, peran, cabang, created_at, updated_at) 
          VALUES (1, 'Admin Utama', 'admin@wimbledoc.com', '08111', 'hashed', 'SUPER_ADMIN', 'Pusat', datetime('now'), datetime('now'))`);
          
  // Insert Tournament
  db.run(`INSERT INTO Tournament (id, name, description, event_date, reg_start, reg_end, status, branch_id, created_at, updated_at)
          VALUES (1, 'Wimbledoc Padel Open 2026', 'Turnamen Padel Nasional', datetime('now', '+2 months'), datetime('now', '-10 days'), datetime('now', '+30 days'), 'ACTIVE', 1, datetime('now'), datetime('now'))`);
          
  console.log("Dummy data seeded successfully.");
});

db.close();

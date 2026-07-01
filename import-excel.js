const XLSX = require('xlsx');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

async function main() {
  const workbook = XLSX.readFile('d:\\Wimbledoc\\DATA PESERTA SURABAYA.xlsx');
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet);

  const pool = mysql.createPool({
    host: 'localhost',
    user: 'david',
    password: 'david20juni2003#',
    database: 'wtms_db',
    port: 3306,
  });

  try {
    // 1. Ensure Branch exists
    let [branches] = await pool.query('SELECT id FROM Branch WHERE name = "Surabaya"');
    let branchId;
    if (branches.length === 0) {
      const [res] = await pool.query('INSERT INTO Branch (name, location) VALUES ("Surabaya", "Surabaya")');
      branchId = res.insertId;
    } else {
      branchId = branches[0].id;
    }

    // 2. Ensure Tournament exists
    let [tournaments] = await pool.query('SELECT id FROM Tournament WHERE name = "Wimbledoc Surabaya"');
    let tournamentId;
    if (tournaments.length === 0) {
      const [res] = await pool.query(`
        INSERT INTO Tournament (name, description, event_date, reg_start, reg_end, status, branch_id)
        VALUES ("Wimbledoc Surabaya", "Imported from Excel", "2026-12-01 08:00:00", "2026-01-01 08:00:00", "2026-11-30 08:00:00", "ACTIVE", ?)
      `, [branchId]);
      tournamentId = res.insertId;
    } else {
      tournamentId = tournaments[0].id;
    }

    const defaultPassword = await bcrypt.hash('password123', 10);

    for (const row of data) {
      const categoryName = row['Apa kategori yang akan anda ikuti? \n']?.trim() || 'Unknown Category';
      
      // Ensure Category exists
      let [categories] = await pool.query('SELECT id FROM Category WHERE name = ? AND tournament_id = ?', [categoryName, tournamentId]);
      let categoryId;
      if (categories.length === 0) {
        const [res] = await pool.query('INSERT INTO Category (name, quota, price, tournament_id) VALUES (?, 100, 500000, ?)', [categoryName, tournamentId]);
        categoryId = res.insertId;
      } else {
        categoryId = categories[0].id;
      }

      // Helper to create or find user
      async function getOrCreateUser(nama, hp, profesi, spesialisasi, tempatKerja, ig, bukti, email) {
        if (!hp) return null;
        const safeHp = String(hp).trim();
        const safeEmail = email ? String(email).trim() : `${safeHp}@wimbledoc.local`;
        
        let [users] = await pool.query('SELECT id FROM User WHERE no_whatsapp = ? OR email = ?', [safeHp, safeEmail]);
        if (users.length > 0) return users[0].id;

        const [res] = await pool.query(`
          INSERT INTO User (nama_lengkap, email, no_whatsapp, password_hash, profesi, spesialisasi, tempat_kerja, instagram, bukti_profesi, cabang)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, "Surabaya")
        `, [
          nama || 'Unknown', 
          safeEmail, 
          safeHp, 
          defaultPassword,
          profesi || null,
          spesialisasi || null,
          tempatKerja || null,
          ig || null,
          bukti || null
        ]);
        return res.insertId;
      }

      // P1
      const p1Email = row['Email Address'];
      const p1Id = await getOrCreateUser(
        row['Nama Player 1'], row['No. HP Player 1'], row['Profesi Player 1'],
        row['Jika anda dokter spesialis, mohon isi apakah jenis spesialisasi anda?'],
        row['Tempat bekerja (Klinik / Rs / Universitas Jika Masih dalam Masa Studi)'],
        row['Akun Instagram Player 1'], row['Upload bukti anda berprofesi di dunia kedokteran'],
        p1Email
      );

      // P2
      const p2Id = await getOrCreateUser(
        row['Nama Player 2'], row['No. HP Player 2'], row['Profesi Player 2'],
        row['Jika partner anda dokter spesialis, mohon isi apakah jenis spesialisasinya?'],
        row['Tempat bekerja (Klinik / Rs / Universitas Jika Masih dalam Masa Studi) 2'],
        row['Akun Instagram Player 2'], row['Upload bukti partner anda berprofesi di dunia kedokteran'],
        null
      );

      if (!p1Id) {
         console.log('Skipping row without P1 ID', row['No']);
         continue;
      }

      // Registration
      const regNo = 'REG-SBY-' + crypto.randomBytes(4).toString('hex').toUpperCase();
      const qrCode = 'QR-SBY-' + crypto.randomBytes(4).toString('hex').toUpperCase();

      const [regRes] = await pool.query(`
        INSERT INTO Registration (no_registrasi, user_id, partner_id, category_id, status, ukuran_jersey_p1, ukuran_jersey_p2, qr_code)
        VALUES (?, ?, ?, ?, 'APPROVED', ?, ?, ?)
      `, [
        regNo, p1Id, p2Id, categoryId, 
        row['Ukuran Jersey Player 1 :'] || 'M', 
        row['Ukuran Jersey Player 2 :'] || 'M', 
        qrCode
      ]);

      const regId = regRes.insertId;

      // Payment Proof
      if (row['Bukti Transfer']) {
         await pool.query(`
           INSERT INTO PaymentProof (registration_id, file_path, file_name_original, file_size_bytes, mime_type)
           VALUES (?, ?, 'transfer.jpg', 1000, 'image/jpeg')
         `, [regId, row['Bukti Transfer']]);
      }
      
      // Initialize empty CheckIn
      await pool.query(`
        INSERT INTO CheckIn (registration_id, checked_in_by, location)
        VALUES (?, 1, 'Surabaya Import')
      `, [regId]);

      console.log(`Imported registration ${regNo} for ${row['Nama Player 1']}`);
    }

    console.log('Import completed successfully.');
  } catch (error) {
    console.error('Import failed:', error);
  } finally {
    pool.end();
  }
}

main();

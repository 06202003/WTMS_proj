import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { RowDataPacket } from "mysql2";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { qrCode, checkin_p1, checkin_p2, jersey_taken_p1, jersey_taken_p2, meal_taken, dryRun } = body;

    if (!qrCode) {
      return NextResponse.json({ error: "Missing QR Code" }, { status: 400 });
    }

    let baseQrCode = qrCode;
    let autoAction = null;
    
    if (qrCode.endsWith('-P1-CHECKIN')) {
      baseQrCode = qrCode.replace('-P1-CHECKIN', '');
      autoAction = 'P1-CHECKIN';
    } else if (qrCode.endsWith('-P1-MEAL')) {
      baseQrCode = qrCode.replace('-P1-MEAL', '');
      autoAction = 'P1-MEAL';
    } else if (qrCode.endsWith('-P2-CHECKIN')) {
      baseQrCode = qrCode.replace('-P2-CHECKIN', '');
      autoAction = 'P2-CHECKIN';
    } else if (qrCode.endsWith('-P2-MEAL')) {
      baseQrCode = qrCode.replace('-P2-MEAL', '');
      autoAction = 'P2-MEAL';
    }

    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT r.id, r.status, u.nama_lengkap as name, c.name as category, 
              r.ukuran_jersey_p1, r.ukuran_jersey_p2, 
              u2.nama_lengkap as partner_name,
              r.jersey_taken_p1, r.jersey_taken_p2, c.tournament_id,
              chk.p1_checked_in_at, chk.p2_checked_in_at, chk.meal_taken
       FROM Registration r 
       JOIN User u ON r.user_id = u.id 
       JOIN Category c ON r.category_id = c.id 
       LEFT JOIN User u2 ON r.partner_id = u2.id
       LEFT JOIN CheckIn chk ON chk.registration_id = r.id
       WHERE r.qr_code = ? OR r.no_registrasi = ?`,
      [baseQrCode, baseQrCode]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "QR Code not found or invalid." }, { status: 404 });
    }

    const reg = rows[0];

    if (reg.status !== "APPROVED" && reg.status !== "CHECKED_IN") {
      return NextResponse.json({ error: `Registration has not been approved (Status: ${reg.status})` }, { status: 400 });
    }

    const [meals] = await db.execute<RowDataPacket[]>(
      `SELECT name, description FROM Meal WHERE tournament_id = ?`,
      [reg.tournament_id]
    );

    const j1 = jersey_taken_p1 !== undefined ? jersey_taken_p1 : reg.jersey_taken_p1;
    const j2 = jersey_taken_p2 !== undefined ? jersey_taken_p2 : reg.jersey_taken_p2;
    const c1 = checkin_p1;
    const c2 = checkin_p2;
    const mt = meal_taken !== undefined ? meal_taken : reg.meal_taken;

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // IF IT IS AN AUTO-ACTION FROM NEW BARCODES
      if (autoAction && dryRun) { // using dryRun as a trigger because scanner sets it to true initially
        const adminId = parseInt(session.user.id || "0");
        
        let autoMessage = "";
        let autoError = "";

        // Check if CheckIn record exists
        const [chkRows] = await connection.execute<RowDataPacket[]>('SELECT id FROM CheckIn WHERE registration_id = ?', [reg.id]);
        if (chkRows.length === 0) {
           await connection.execute(
            `INSERT INTO CheckIn (registration_id, checked_in_by, location) VALUES (?, ?, 'Venue')`,
            [reg.id, adminId]
           );
        }

        if (autoAction === 'P1-CHECKIN') {
           if (reg.p1_checked_in_at) autoError = "Player 1 has already checked in.";
           else {
             await connection.execute(
               `UPDATE CheckIn SET p1_checked_in_at = NOW(), p1_jersey_taken_by = 'P1' WHERE registration_id = ?`, [reg.id]
             );
             await connection.execute(`UPDATE Registration SET status = 'CHECKED_IN', jersey_taken_p1 = 1 WHERE id = ?`, [reg.id]);
             autoMessage = `Player 1 (${reg.name}) Checked In! Jersey Size: ${reg.ukuran_jersey_p1 || '-'}`;
           }
        } else if (autoAction === 'P2-CHECKIN') {
           if (reg.p2_checked_in_at) autoError = "Player 2 has already checked in.";
           else if (!reg.partner_name) autoError = "Player 2 does not exist.";
           else {
             await connection.execute(
               `UPDATE CheckIn SET p2_checked_in_at = NOW(), p2_jersey_taken_by = 'P2' WHERE registration_id = ?`, [reg.id]
             );
             await connection.execute(`UPDATE Registration SET status = 'CHECKED_IN', jersey_taken_p2 = 1 WHERE id = ?`, [reg.id]);
             autoMessage = `Player 2 (${reg.partner_name}) Checked In! Jersey Size: ${reg.ukuran_jersey_p2 || '-'}`;
           }
        } else if (autoAction === 'P1-MEAL') {
           // We'll use the new column meal_taken_p1_at. We need to check if it's already set.
           // Since we don't select it above, let's query it
           const [mRows] = await connection.execute<RowDataPacket[]>('SELECT meal_taken_p1_at, meal_taken_p2_at FROM CheckIn WHERE registration_id = ?', [reg.id]);
           if (mRows.length > 0 && mRows[0].meal_taken_p1_at) {
             autoError = "Player 1 has already taken their meal.";
           } else {
             await connection.execute(
               `UPDATE CheckIn SET meal_taken_p1_at = NOW() WHERE registration_id = ?`, [reg.id]
             );
             autoMessage = `Meal given to Player 1 (${reg.name}).`;
           }
        } else if (autoAction === 'P2-MEAL') {
           const [mRows] = await connection.execute<RowDataPacket[]>('SELECT meal_taken_p1_at, meal_taken_p2_at FROM CheckIn WHERE registration_id = ?', [reg.id]);
           if (!reg.partner_name) autoError = "Player 2 does not exist.";
           else if (mRows.length > 0 && mRows[0].meal_taken_p2_at) {
             autoError = "Player 2 has already taken their meal.";
           } else {
             await connection.execute(
               `UPDATE CheckIn SET meal_taken_p2_at = NOW() WHERE registration_id = ?`, [reg.id]
             );
             autoMessage = `Meal given to Player 2 (${reg.partner_name}).`;
           }
        }

        if (autoError) {
          await connection.rollback();
          return NextResponse.json({ error: autoError }, { status: 400 });
        }

        await connection.commit();
        return NextResponse.json({ 
          success: true, 
          autoSuccess: true,
          message: autoMessage
        });
      }

      if (dryRun) {
        await connection.commit(); // just to release
        return NextResponse.json({ 
          success: true, 
          name: reg.name,
          category: reg.category,
          regData: { ...reg, meals: meals || [] }
        });
      }

      await connection.execute(
        'UPDATE Registration SET status = ?, jersey_taken_p1 = ?, jersey_taken_p2 = ? WHERE id = ?',
        ['CHECKED_IN', j1, j2, reg.id]
      );

      // Check if CheckIn record exists
      const [chkRows] = await connection.execute<RowDataPacket[]>('SELECT id FROM CheckIn WHERE registration_id = ?', [reg.id]);
      
      const adminId = parseInt(session.user.id || "0");
      if (chkRows.length === 0) {
        await connection.execute(
          `INSERT INTO CheckIn (registration_id, checked_in_by, location, p1_checked_in_at, p2_checked_in_at, p1_jersey_taken_by, p2_jersey_taken_by, meal_taken) 
           VALUES (?, ?, 'Venue', ?, ?, ?, ?, ?)`,
          [
            reg.id, adminId, 
            c1 ? new Date() : null, 
            c2 ? new Date() : null,
            j1 ? 'P1' : null,
            j2 ? 'P2' : null,
            mt ? 1 : 0
          ]
        );
      } else {
        await connection.execute(
          `UPDATE CheckIn 
           SET p1_checked_in_at = COALESCE(p1_checked_in_at, ?), 
               p2_checked_in_at = COALESCE(p2_checked_in_at, ?),
               p1_jersey_taken_by = COALESCE(p1_jersey_taken_by, ?),
               p2_jersey_taken_by = COALESCE(p2_jersey_taken_by, ?),
               meal_taken = ?
           WHERE registration_id = ?`,
          [
            c1 ? new Date() : null,
            c2 ? new Date() : null,
            j1 ? 'P1' : null,
            j2 ? 'P1' : null, // Simplification: assume the person checking in right now takes it. If needed, this could be more sophisticated.
            mt ? 1 : 0,
            reg.id
          ]
        );
      }

      await connection.commit();
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }

    return NextResponse.json({ 
      success: true, 
      name: reg.name,
      category: reg.category,
      regData: { ...reg, jersey_taken_p1: j1, jersey_taken_p2: j2 }
    });
  } catch (error: any) {
    console.error("Check-in Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

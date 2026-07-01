import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

async function saveFile(file: File | null): Promise<string | null> {
  if (!file || typeof file === "string") return null;
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const uploadDir = join(process.cwd(), "public/uploads/profesi");
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }
  const fileName = `${Date.now()}-${file.name.replace(/\s/g, "_")}`;
  const filePath = join(uploadDir, fileName);
  await writeFile(filePath, buffer);
  return `/uploads/profesi/${fileName}`;
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = parseInt(session.user.id);

    const formData = await req.formData();
    
    const tournamentId = formData.get("tournamentId") as string;
    const category = formData.get("category") as string;
    const club = formData.get("club") as string;
    
    const p1Name = formData.get("p1Name") as string;
    const p1Email = formData.get("p1Email") as string;
    const p1Phone = formData.get("p1Phone") as string;
    const p1Jersey = formData.get("p1Jersey") as string;
    const p1Profesi = formData.get("p1Profesi") as string;
    const p1Spesialisasi = formData.get("p1Spesialisasi") as string;
    const p1TempatKerja = formData.get("p1TempatKerja") as string;
    const p1Instagram = formData.get("p1Instagram") as string;
    const p1Bukti = formData.get("p1Bukti") as File | null;

    const p2Name = formData.get("p2Name") as string;
    const p2Email = formData.get("p2Email") as string;
    const p2Phone = formData.get("p2Phone") as string;
    const p2Jersey = formData.get("p2Jersey") as string;
    const p2Profesi = formData.get("p2Profesi") as string;
    const p2Spesialisasi = formData.get("p2Spesialisasi") as string;
    const p2TempatKerja = formData.get("p2TempatKerja") as string;
    const p2Instagram = formData.get("p2Instagram") as string;
    const p2Bukti = formData.get("p2Bukti") as File | null;

    if (!tournamentId || !category || !p1Jersey) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const [categoryRows] = await db.execute<RowDataPacket[]>(
      'SELECT id FROM Category WHERE tournament_id = ? AND name = ? LIMIT 1',
      [parseInt(tournamentId), category]
    );

    if (categoryRows.length === 0) {
      return NextResponse.json({ error: "Kategori tidak ditemukan untuk turnamen ini" }, { status: 404 });
    }
    const categoryRecord = categoryRows[0];

    const [existingRegs] = await db.execute<RowDataPacket[]>(
      `SELECT r.id 
       FROM Registration r 
       JOIN Category c ON r.category_id = c.id 
       WHERE r.user_id = ? AND c.tournament_id = ? AND r.status != 'REJECTED' AND r.status != 'CANCELLED'
       LIMIT 1`,
      [userId, parseInt(tournamentId)]
    );

    if (existingRegs.length > 0) {
      return NextResponse.json({ 
        error: "Anda sudah mendaftar di turnamen ini. Setiap pemain hanya boleh mendaftar 1 kategori per turnamen." 
      }, { status: 400 });
    }

    // Process files
    const p1BuktiUrl = await saveFile(p1Bukti);
    const p2BuktiUrl = await saveFile(p2Bukti);

    // Update P1 info
    await db.execute(
      `UPDATE User SET profesi = ?, spesialisasi = ?, tempat_kerja = ?, instagram = ? ${p1BuktiUrl ? ', bukti_profesi = ?' : ''} WHERE id = ?`,
      p1BuktiUrl 
        ? [p1Profesi, p1Spesialisasi, p1TempatKerja, p1Instagram, p1BuktiUrl, userId]
        : [p1Profesi, p1Spesialisasi, p1TempatKerja, p1Instagram, userId]
    );

    // Process P2
    let partnerId: number | null = null;
    if (p2Name) {
      const partnerEmail = p2Email || `partner-${Date.now()}-${Math.floor(Math.random() * 1000)}@example.com`;
      const [partnerRows] = await db.execute<RowDataPacket[]>(
        'SELECT id FROM User WHERE email = ? LIMIT 1',
        [partnerEmail]
      );

      if (partnerRows.length === 0) {
        const [result] = await db.execute<ResultSetHeader>(
          `INSERT INTO User (nama_lengkap, email, no_whatsapp, peran, profesi, spesialisasi, tempat_kerja, instagram, bukti_profesi) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [p2Name, partnerEmail, p2Phone || "", "USER", p2Profesi, p2Spesialisasi, p2TempatKerja, p2Instagram, p2BuktiUrl]
        );
        partnerId = result.insertId;
      } else {
        partnerId = partnerRows[0].id;
        await db.execute(
          `UPDATE User SET profesi = ?, spesialisasi = ?, tempat_kerja = ?, instagram = ? ${p2BuktiUrl ? ', bukti_profesi = ?' : ''} WHERE id = ?`,
          p2BuktiUrl 
            ? [p2Profesi, p2Spesialisasi, p2TempatKerja, p2Instagram, p2BuktiUrl, partnerId]
            : [p2Profesi, p2Spesialisasi, p2TempatKerja, p2Instagram, partnerId]
        );
      }
    }

    const regNum = `REG-WMD-${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 1000)}`;

    const [regResult] = await db.execute<ResultSetHeader>(
      `INSERT INTO Registration (
        no_registrasi, user_id, partner_id, category_id, status, 
        ukuran_jersey_p1, ukuran_jersey_p2, cabang_perwakilan
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        regNum, userId, partnerId, categoryRecord.id, "PENDING",
        p1Jersey, p2Jersey || null, club || null
      ]
    );
    
    await db.execute(
      `INSERT INTO CheckIn (registration_id, checked_in_by, location) VALUES (?, ?, ?)`,
      [regResult.insertId, userId, 'System']
    );

    return NextResponse.json({ success: true, registrationId: regResult.insertId });
  } catch (error: any) {
    console.error("Registration Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

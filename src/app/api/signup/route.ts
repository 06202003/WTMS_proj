import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcrypt";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nama_lengkap, email, no_whatsapp, password, cabang, profesi, spesialisasi, kategori_tempat_kerja, tempat_kerja, instagram } = body;

    if (!nama_lengkap || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if user already exists
    const [existingRows] = await db.execute<RowDataPacket[]>(
      'SELECT id FROM User WHERE email = ?',
      [email]
    );

    if (existingRows.length > 0) {
      return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await db.execute<ResultSetHeader>(
      'INSERT INTO User (nama_lengkap, email, no_whatsapp, password_hash, cabang, peran, profesi, spesialisasi, kategori_tempat_kerja, tempat_kerja, instagram) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [nama_lengkap, email, no_whatsapp || "", passwordHash, cabang || null, "USER", profesi || null, spesialisasi || null, kategori_tempat_kerja || null, tempat_kerja || null, instagram || null]
    );

    return NextResponse.json({ success: true, userId: result.insertId });
  } catch (error: any) {
    console.error("Signup API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

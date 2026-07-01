import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcrypt";
import { RowDataPacket } from "mysql2";

export async function POST() {
  try {
    const email = "google-peserta@example.com";
    const [rows] = await db.execute<RowDataPacket[]>('SELECT id FROM User WHERE email = ?', [email]);
    
    if (rows.length === 0) {
      const passwordHash = await bcrypt.hash("google_mock_password", 10);
      await db.execute(
        'INSERT INTO User (nama_lengkap, email, no_whatsapp, password_hash, peran) VALUES (?, ?, ?, ?, ?)',
        ["Google User (Simulasi)", email, "081299998888", passwordHash, "USER"]
      );
      console.log("Mock Google login user seeded successfully.");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Mock Google Setup Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

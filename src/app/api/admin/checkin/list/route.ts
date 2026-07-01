import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { RowDataPacket } from "mysql2";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "all"; // 'all', 'meal'
    
    // Fetch participants. We only want APPROVED or CHECKED_IN registrations
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT r.id, r.no_registrasi, r.status, c.name as category_name, t.name as tournament_name,
              u1.nama_lengkap as p1_name, u1.tempat_kerja as p1_tempat_kerja,
              u2.nama_lengkap as p2_name, u2.tempat_kerja as p2_tempat_kerja,
              chk.p1_checked_in_at, chk.p2_checked_in_at, 
              chk.meal_taken_p1_at, chk.meal_taken_p2_at
       FROM Registration r
       JOIN Category c ON r.category_id = c.id
       JOIN Tournament t ON c.tournament_id = t.id
       JOIN User u1 ON r.user_id = u1.id
       LEFT JOIN User u2 ON r.partner_id = u2.id
       LEFT JOIN CheckIn chk ON chk.registration_id = r.id
       WHERE r.status IN ('APPROVED', 'CHECKED_IN')
       ORDER BY chk.p1_checked_in_at DESC, r.id DESC
       LIMIT 100`
    );

    const participants = rows.map(r => ({
      registration_id: r.id,
      no_registrasi: r.no_registrasi,
      tournament_name: r.tournament_name,
      category_name: r.category_name,
      
      p1_name: r.p1_name,
      p1_tempat_kerja: r.p1_tempat_kerja,
      p1_checked_in_at: r.p1_checked_in_at,
      p1_checked_in: !!r.p1_checked_in_at,
      p1_meal_taken_at: r.meal_taken_p1_at,
      p1_meal_taken: !!r.meal_taken_p1_at,
      
      p2_name: r.p2_name,
      p2_tempat_kerja: r.p2_tempat_kerja,
      p2_checked_in_at: r.p2_checked_in_at,
      p2_checked_in: !!r.p2_checked_in_at,
      p2_meal_taken_at: r.meal_taken_p2_at,
      p2_meal_taken: !!r.meal_taken_p2_at,
    }));

    return NextResponse.json({ participants });
  } catch (error: any) {
    console.error("Fetch Check-in List Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

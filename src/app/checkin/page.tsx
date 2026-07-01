import { auth } from "@/auth";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { redirect } from "next/navigation";
import CheckInClient from "./page-client";

export default async function CheckInPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = parseInt(session.user.id);

  // Fetch the user's latest registration that is APPROVED
  const [regRows] = await db.execute<RowDataPacket[]>(
    `SELECT r.no_registrasi, r.qr_code, u.nama_lengkap as user_name, u2.nama_lengkap as partner_name,
            c.name as category_name, t.name as tournament_name
     FROM Registration r
     JOIN User u ON r.user_id = u.id
     LEFT JOIN User u2 ON r.partner_id = u2.id
     JOIN Category c ON r.category_id = c.id
     JOIN Tournament t ON c.tournament_id = t.id
     WHERE r.user_id = ? AND r.status = 'APPROVED'
     ORDER BY r.submitted_at DESC
     LIMIT 1`,
    [userId]
  );
  
  const reg = regRows[0];

  if (!reg) {
    // If no approved registration exists, redirect back to the status dashboard
    redirect("/dashboard");
  }

  return (
    <CheckInClient
      userName={reg.user_name}
      partnerName={reg.partner_name}
      tournamentName={reg.tournament_name}
      categoryName={reg.category_name}
      qrCode={reg.qr_code || reg.no_registrasi}
      noReg={reg.no_registrasi}
    />
  );
}

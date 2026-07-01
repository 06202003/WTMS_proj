import DashboardClient from "./page-client";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const userRole = (session.user as any).role;
  if (userRole === "ADMIN" || userRole === "SUPER_ADMIN") {
    redirect("/admin");
  }

  const userId = parseInt(session.user.id);
  const [userRows] = await db.execute<RowDataPacket[]>(
    'SELECT nama_lengkap FROM User WHERE id = ?',
    [userId]
  );
  const user = userRows[0];

  const [regRows] = await db.execute<RowDataPacket[]>(
    `SELECT r.id, r.no_registrasi, r.status, r.submitted_at, r.reject_reason, 
            c.name as category_name, c.price as category_price, t.name as tournament_name
     FROM Registration r
     JOIN Category c ON r.category_id = c.id
     JOIN Tournament t ON c.tournament_id = t.id
     WHERE r.user_id = ? AND t.status != 'COMPLETED'
     ORDER BY r.submitted_at DESC`,
    [userId]
  );

  const registrations = regRows.map(reg => ({
    id: reg.id,
    noReg: reg.no_registrasi,
    tournament: reg.tournament_name,
    category: reg.category_name,
    price: parseFloat(reg.category_price) || 0,
    status: reg.status,
    rejectReason: reg.reject_reason,
    date: new Date(reg.submitted_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  }));

  return (
    <DashboardClient 
      userName={user?.nama_lengkap || "Peserta"} 
      registrations={registrations} 
    />
  );
}

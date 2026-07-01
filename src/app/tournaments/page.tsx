import { auth } from "@/auth";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { redirect } from "next/navigation";
import TournamentsPageClient from "./page-client";

export default async function TournamentsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const userId = parseInt(session.user.id);
  const [userRows] = await db.execute<RowDataPacket[]>(
    'SELECT nama_lengkap FROM User WHERE id = ?',
    [userId]
  );
  const user = userRows[0];

  const [tournamentsRaw] = await db.execute<RowDataPacket[]>(
    `SELECT t.id, t.name, t.description, t.event_date, b.name as branch_name 
     FROM Tournament t 
     JOIN Branch b ON t.branch_id = b.id 
     WHERE t.status = 'ACTIVE' 
     ORDER BY t.event_date ASC`
  );

  const [categoriesRaw] = await db.execute<RowDataPacket[]>(
    `SELECT c.tournament_id, c.name, c.quota, 
            (SELECT COUNT(*) FROM Registration r WHERE r.category_id = c.id AND r.status != 'REJECTED' AND r.status != 'CANCELLED') as filled_slots 
     FROM Category c`
  );

  const tournaments = tournamentsRaw.map((t: any) => ({
    id: t.id,
    name: t.name,
    description: t.description || "Turnamen Padel resmi Wimbledoc.",
    date: new Date(t.event_date),
    location: t.branch_name,
    categories: categoriesRaw
      .filter((c: any) => c.tournament_id === t.id)
      .map((c: any) => ({
        name: c.name,
        quota: c.quota,
        filledSlots: c.filled_slots,
        availableSlots: Math.max(0, c.quota - c.filled_slots),
        isFull: c.filled_slots >= c.quota
      }))
  }));

  return (
    <TournamentsPageClient 
      userName={user?.nama_lengkap || "Peserta"} 
      tournaments={tournaments} 
    />
  );
}

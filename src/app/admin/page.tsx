import AdminDashboardClient from "./page-client";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { RowDataPacket } from "mysql2";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await auth();
  if (!session?.user || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "SUPER_ADMIN")) {
    redirect("/login");
  }

  // Fetch Tournaments
  const [tournamentsRaw] = await db.execute<RowDataPacket[]>('SELECT id, name FROM Tournament');
  
  // Fetch Categories
  const [categoriesRaw] = await db.execute<RowDataPacket[]>('SELECT id, name, quota, tournament_id FROM Category');

  // Fetch all Registrations
  const [registrationsRaw] = await db.execute<RowDataPacket[]>(
    `SELECT r.id, r.no_registrasi, r.status, r.submitted_at, 
            c.id as category_id, c.name as category_name, c.price,
            t.id as tournament_id, t.name as tournament_name,
            u1.nama_lengkap as u1_name, u2.nama_lengkap as u2_name
     FROM Registration r
     JOIN Category c ON r.category_id = c.id
     JOIN Tournament t ON c.tournament_id = t.id
     JOIN User u1 ON r.user_id = u1.id
     LEFT JOIN User u2 ON r.partner_id = u2.id
     ORDER BY r.submitted_at DESC`
  );

  // Fetch CheckIn data to calculate attendance rate and meal distribution
  const [checkInsRaw] = await db.execute<RowDataPacket[]>(
    'SELECT registration_id, meal_taken, checked_in_at FROM CheckIn'
  );

  return (
    <AdminDashboardClient
      tournaments={tournamentsRaw}
      categories={categoriesRaw}
      registrations={registrationsRaw}
      checkIns={checkInsRaw}
    />
  );
}

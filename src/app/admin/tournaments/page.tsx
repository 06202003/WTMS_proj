import TournamentsClient from "./page-client";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function TournamentsPage() {
  const session = await auth();
  if (!session?.user || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "SUPER_ADMIN")) {
    redirect("/login");
  }

  const [rawTournaments] = await db.execute<RowDataPacket[]>(
    `SELECT t.id, t.name, t.status, t.event_date, t.branch_id, t.description, t.reg_start, t.reg_end, b.name as branch_name 
     FROM Tournament t 
     JOIN Branch b ON t.branch_id = b.id 
     ORDER BY t.event_date DESC`
  );

  const [categoriesRaw] = await db.execute<RowDataPacket[]>('SELECT id, name, quota, price, tournament_id FROM Category');
  const categories = categoriesRaw.map((c: any) => ({ id: c.id, name: c.name, quota: c.quota, price: c.price, tournament_id: c.tournament_id }));

  const tournaments = rawTournaments.map((t: any) => ({
    id: t.id,
    name: t.name,
    status: t.status === "ACTIVE" ? "Active" : t.status === "DRAFT" ? "Draft" : "Completed",
    date: new Date(t.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
    branch: t.branch_name,
    branch_id: t.branch_id,
    description: t.description,
    event_date: t.event_date,
    reg_start: t.reg_start,
    reg_end: t.reg_end,
    categories: categories.filter((c: any) => c.tournament_id === t.id)
  }));

  const [branchesRaw] = await db.execute<RowDataPacket[]>('SELECT id, name FROM Branch');
  const branches = branchesRaw.map((b: any) => ({ id: b.id, name: b.name }));

  const uniqueCategories = Array.from(new Set(categories.map((c: any) => c.name)));

  return <TournamentsClient initialTournaments={tournaments} branches={branches} allCategories={uniqueCategories} />;
}

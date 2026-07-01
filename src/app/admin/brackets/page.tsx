import BracketsClient from "./page-client";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function BracketsPage() {
  const session = await auth();
  if (!session?.user || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "SUPER_ADMIN")) {
    redirect("/login");
  }

  // Fetch all tournaments and their categories to populate the selectors
  const [tournamentsRaw] = await db.execute<RowDataPacket[]>('SELECT id, name FROM Tournament ORDER BY id DESC');
  
  const [categoriesRaw] = await db.execute<RowDataPacket[]>('SELECT id, name, tournament_id FROM Category');

  const tournaments = tournamentsRaw.map((t: any) => ({
    id: t.id,
    name: t.name,
    categories: categoriesRaw
      .filter((c: any) => c.tournament_id === t.id)
      .map((c: any) => ({ id: c.id, name: c.name }))
  }));

  return <BracketsClient initialTournaments={tournaments} />;
}

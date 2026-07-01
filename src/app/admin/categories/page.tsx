import CategoriesClient from "./page-client";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function CategoriesPage() {
  const session = await auth();
  if (!session?.user || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "SUPER_ADMIN")) {
    redirect("/login");
  }

  const [categoriesRaw] = await db.execute<RowDataPacket[]>(
    `SELECT c.id, c.name, c.quota, c.price, c.tournament_id, t.name as tournament_name
     FROM Category c
     LEFT JOIN Tournament t ON c.tournament_id = t.id
     ORDER BY c.id DESC`
  );

  const [tournamentsRaw] = await db.execute<RowDataPacket[]>(
    'SELECT id, name FROM Tournament ORDER BY id DESC'
  );

  const categories = categoriesRaw.map(c => ({
    id: c.id,
    name: c.name,
    quota: c.quota,
    price: Number(c.price),
    tournament_id: c.tournament_id,
    tournament_name: c.tournament_name || "Unknown"
  }));

  const tournaments = tournamentsRaw.map(t => ({
    id: t.id,
    name: t.name
  }));

  return <CategoriesClient initialCategories={categories} tournaments={tournaments} />;
}

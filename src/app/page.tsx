import LandingPageClient from "./page-client";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { RowDataPacket } from "mysql2";

export default async function Page() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  const [tournamentsRaw] = await db.execute<RowDataPacket[]>(
    'SELECT * FROM Tournament WHERE status = ? ORDER BY event_date ASC',
    ['ACTIVE']
  );

  const tournaments = tournamentsRaw.map((t: any) => ({
    id: t.id,
    name: t.name,
    date: new Date(t.event_date),
    location: "Wimbledoc Arena", // Mock location since we didn't add it to schema
    status: t.status === "ACTIVE" ? "OPEN" : "UPCOMING",
    categories: ["Men's Doubles", "Women's Doubles", "Mixed Doubles"] // Mock categories
  }));

  return <LandingPageClient tournaments={tournaments} isLoggedIn={isLoggedIn} />;
}

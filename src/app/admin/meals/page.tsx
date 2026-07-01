import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";
import MealsClient from "./page-client";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function MealsPage() {
  const session = await auth();
  if (!session?.user || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "SUPER_ADMIN")) {
    redirect("/login");
  }

  const [tournaments] = await db.execute<RowDataPacket[]>(
    'SELECT id, name FROM Tournament ORDER BY id DESC'
  );

  return <MealsClient tournaments={tournaments as any[]} />;
}

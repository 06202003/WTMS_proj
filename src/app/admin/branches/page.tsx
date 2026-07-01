import BranchesClient from "./page-client";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function BranchesPage() {
  const session = await auth();
  if (!session?.user || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "SUPER_ADMIN")) {
    redirect("/login");
  }

  const [rawBranches] = await db.execute<RowDataPacket[]>(
    'SELECT id, name, location, created_at FROM Branch ORDER BY id DESC'
  );

  const branches = rawBranches.map((b: any) => ({
    id: b.id,
    name: b.name,
    location: b.location || "-",
    created_at: new Date(b.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  }));

  return <BranchesClient initialBranches={branches} />;
}

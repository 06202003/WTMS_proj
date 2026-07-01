import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";
import RegisterPageClient from "./page-client";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

import { Suspense } from "react";

export default async function Page({ searchParams }: { searchParams: Promise<{ tournamentId?: string }> }) {
  const session = await auth();
  const searchParamsResolved = await searchParams;
  const tournamentId = searchParamsResolved?.tournamentId || "";

  if (!session?.user) {
    redirect(`/login?callbackUrl=/register?tournamentId=${tournamentId}`);
  }

  const [tournamentsRaw] = await db.execute<RowDataPacket[]>(
    'SELECT id, name FROM Tournament WHERE status = ?',
    ['ACTIVE']
  );

  const tournaments = [];
  for (const t of tournamentsRaw) {
    const [cats] = await db.execute<RowDataPacket[]>('SELECT id, name FROM Category WHERE tournament_id = ?', [t.id]);
    tournaments.push({
      id: t.id,
      name: t.name,
      categories: cats.map(c => c.name)
    });
  }

  let currentUser = null;
  if (session.user?.id) {
    const [userRows] = await db.execute<RowDataPacket[]>(
      'SELECT nama_lengkap, email, no_whatsapp, profesi, spesialisasi, kategori_tempat_kerja, tempat_kerja, instagram FROM User WHERE id = ?',
      [session.user.id]
    );
    if (userRows.length > 0) {
      currentUser = {
        name: userRows[0].nama_lengkap || "",
        email: userRows[0].email || "",
        phone: userRows[0].no_whatsapp || "",
        profesi: userRows[0].profesi || "",
        spesialisasi: userRows[0].spesialisasi || "",
        kategoriTempatKerja: userRows[0].kategori_tempat_kerja || "",
        tempatKerja: userRows[0].tempat_kerja || "",
        instagram: userRows[0].instagram || "",
      };
    }
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#003A60] border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <RegisterPageClient tournaments={tournaments} currentUser={currentUser} />
    </Suspense>
  );
}

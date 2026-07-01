import ExportClient from "./page-client";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function ExportPage() {
  const session = await auth();
  if (!session?.user || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "SUPER_ADMIN")) {
    redirect("/login");
  }

  const [rawRegistrations] = await db.execute<RowDataPacket[]>(
    `SELECT r.no_registrasi, r.ukuran_jersey_p1, r.ukuran_jersey_p2, r.status, r.submitted_at, 
            r.jersey_taken_p1, r.jersey_taken_p2,
            u1.nama_lengkap as user_name, u1.profesi as p1_profesi, u1.tempat_kerja as p1_tempat_kerja, u1.spesialisasi as p1_spesialisasi, u1.instagram as p1_instagram,
            u2.nama_lengkap as partner_name, u2.profesi as p2_profesi, u2.tempat_kerja as p2_tempat_kerja, u2.spesialisasi as p2_spesialisasi, u2.instagram as p2_instagram,
            c.name as category_name, t.name as tournament_name
     FROM Registration r
     JOIN User u1 ON r.user_id = u1.id
     LEFT JOIN User u2 ON r.partner_id = u2.id
     JOIN Category c ON r.category_id = c.id
     JOIN Tournament t ON c.tournament_id = t.id
     ORDER BY r.submitted_at DESC`
  );

  const exportData = rawRegistrations.map((r: any) => ({
    "No. Registrasi": r.no_registrasi,
    "Turnamen": r.tournament_name,
    "Kategori": r.category_name,
    "Pemain 1": r.user_name,
    "Profesi P1": r.p1_profesi || "-",
    "Spesialisasi P1": r.p1_spesialisasi || "-",
    "Tempat Kerja P1": r.p1_tempat_kerja || "-",
    "Instagram P1": r.p1_instagram || "-",
    "Jersey P1": `${r.ukuran_jersey_p1} ${r.jersey_taken_p1 ? '(Sudah)' : '(Belum)'}`,
    "Pemain 2": r.partner_name || "-",
    "Profesi P2": r.p2_profesi || "-",
    "Spesialisasi P2": r.p2_spesialisasi || "-",
    "Tempat Kerja P2": r.p2_tempat_kerja || "-",
    "Instagram P2": r.p2_instagram || "-",
    "Jersey P2": r.ukuran_jersey_p2 ? `${r.ukuran_jersey_p2} ${r.jersey_taken_p2 ? '(Sudah)' : '(Belum)'}` : "-",
    "Status": r.status,
    "Waktu Daftar": new Date(r.submitted_at).toLocaleString('id-ID')
  }));

  return <ExportClient initialData={exportData} />;
}

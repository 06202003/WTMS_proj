import ApprovalsClient from "./page-client";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function ApprovalsPage() {
  const session = await auth();
  if (!session?.user || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "SUPER_ADMIN")) {
    redirect("/login");
  }

  const [rawRegistrations] = await db.execute<RowDataPacket[]>(
    `SELECT r.id, r.no_registrasi, r.status, r.submitted_at, 
            r.ukuran_jersey_p1, r.ukuran_jersey_p2, r.cabang_perwakilan,
            u1.nama_lengkap as user_name, u1.no_whatsapp as p1_phone, u1.email as p1_email, u1.tempat_kerja as p1_kerja,
            u2.nama_lengkap as partner_name, u2.no_whatsapp as p2_phone, u2.email as p2_email, u2.tempat_kerja as p2_kerja,
            c.name as category_name, t.name as tournament_name,
            p.file_path as proof_url
     FROM Registration r
     JOIN User u1 ON r.user_id = u1.id
     LEFT JOIN User u2 ON r.partner_id = u2.id
     JOIN Category c ON r.category_id = c.id
     JOIN Tournament t ON c.tournament_id = t.id
     LEFT JOIN PaymentProof p ON p.registration_id = r.id AND p.is_current = true
     ORDER BY r.submitted_at DESC`
  );

  const registrations = rawRegistrations.map((r: any) => ({
    id: r.no_registrasi,
    rawId: r.id,
    name: `${r.user_name} & ${r.partner_name || "Tanpa Partner"}`,
    category: r.category_name,
    tournament: r.tournament_name,
    date: new Date(r.submitted_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
    status: r.status,
    proofUploaded: !!r.proof_url,
    proofUrl: r.proof_url || null,
    p1Name: r.user_name,
    p1Phone: r.p1_phone,
    p1Email: r.p1_email,
    p1Kerja: r.p1_kerja,
    p1Jersey: r.ukuran_jersey_p1,
    p2Name: r.partner_name,
    p2Phone: r.p2_phone,
    p2Email: r.p2_email,
    p2Kerja: r.p2_kerja,
    p2Jersey: r.ukuran_jersey_p2,
    club: r.cabang_perwakilan
  }));

  return <ApprovalsClient initialRegistrations={registrations} />;
}

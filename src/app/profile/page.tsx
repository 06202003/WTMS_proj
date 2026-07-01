import { auth } from "@/auth";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { redirect } from "next/navigation";
import ProfilePageClient from "./page-client";

export default async function ProfilePage() {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }

  const [rows] = await db.execute<RowDataPacket[]>(
    `SELECT 
      nama_lengkap, email, no_whatsapp, no_anggota, cabang, 
      profesi, spesialisasi, kategori_tempat_kerja, tempat_kerja, instagram, bukti_profesi 
     FROM User 
     WHERE id = ?`,
    [session.user.id]
  );

  if (rows.length === 0) {
    redirect("/login");
  }

  const userProfile = {
    name: rows[0].nama_lengkap || "",
    email: rows[0].email || "",
    phone: rows[0].no_whatsapp || "",
    no_anggota: rows[0].no_anggota || "",
    cabang: rows[0].cabang || "",
    profesi: rows[0].profesi || "",
    spesialisasi: rows[0].spesialisasi || "",
    kategoriTempatKerja: rows[0].kategori_tempat_kerja || "",
    tempatKerja: rows[0].tempat_kerja || "",
    instagram: rows[0].instagram || "",
    bukti_profesi: rows[0].bukti_profesi || null,
  };

  return <ProfilePageClient userProfile={userProfile} />;
}

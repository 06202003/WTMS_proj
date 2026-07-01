import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { ResultSetHeader } from "mysql2";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function PUT(req: Request) {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const no_anggota = formData.get("no_anggota") as string;
    const cabang = formData.get("cabang") as string;
    const profesi = formData.get("profesi") as string;
    const spesialisasi = formData.get("spesialisasi") as string;
    const kategoriTempatKerja = formData.get("kategoriTempatKerja") as string;
    const tempatKerja = formData.get("tempatKerja") as string;
    const instagram = formData.get("instagram") as string;
    const buktiProfesi = formData.get("bukti_profesi") as File | null;

    if (!name || !phone) {
      return NextResponse.json({ error: "Name and Phone are required" }, { status: 400 });
    }

    let buktiProfesiUrl: string | null = null;
    if (buktiProfesi && typeof buktiProfesi !== "string") {
      const bytes = await buktiProfesi.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uploadDir = join(process.cwd(), "public/uploads/profesi");
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }
      const fileName = `${Date.now()}-${buktiProfesi.name.replace(/\s/g, "_")}`;
      const filePath = join(uploadDir, fileName);
      await writeFile(filePath, buffer);
      buktiProfesiUrl = `/uploads/profesi/${fileName}`;
    }

    let query = `UPDATE User SET 
        nama_lengkap = ?, 
        no_whatsapp = ?, 
        no_anggota = ?, 
        cabang = ?, 
        profesi = ?, 
        spesialisasi = ?, 
        kategori_tempat_kerja = ?,
        tempat_kerja = ?, 
        instagram = ?`;
    
    let params: any[] = [
        name, 
        phone, 
        no_anggota || null, 
        cabang || null, 
        profesi || null, 
        spesialisasi || null, 
        kategoriTempatKerja || null,
        tempatKerja || null, 
        instagram || null
    ];

    if (buktiProfesiUrl) {
        query += `, bukti_profesi = ?`;
        params.push(buktiProfesiUrl);
    }
    
    query += ` WHERE id = ?`;
    params.push(session.user.id);

    const [result] = await db.execute<ResultSetHeader>(query, params);

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "User not found or no changes made" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Profile API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

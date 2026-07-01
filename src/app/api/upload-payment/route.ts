import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { RowDataPacket } from "mysql2";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const registrationId = formData.get("registrationId") as string;
    const file = formData.get("file") as File;

    if (!registrationId || !file) {
      return NextResponse.json({ error: "Missing registrationId or file" }, { status: 400 });
    }

    const [regRows] = await db.execute<RowDataPacket[]>(
      'SELECT id, user_id FROM Registration WHERE id = ?',
      [parseInt(registrationId)]
    );
    const registration = regRows[0];

    if (!registration) {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    if (registration.user_id !== parseInt(session.user.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to public/uploads/payments
    const uploadDir = join(process.cwd(), "public/uploads/payments");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const fileName = `${Date.now()}-${file.name.replace(/\s/g, "_")}`;
    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/payments/${fileName}`;

    // Create PaymentProof record and update Registration in a transaction
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      await connection.execute(
        'UPDATE PaymentProof SET is_current = 0 WHERE registration_id = ?',
        [parseInt(registrationId)]
      );

      const [countRows] = await connection.execute<RowDataPacket[]>(
        'SELECT COUNT(*) as count FROM PaymentProof WHERE registration_id = ?',
        [parseInt(registrationId)]
      );
      const nextVersion = countRows[0].count + 1;

      await connection.execute(
        `INSERT INTO PaymentProof (registration_id, file_path, file_name_original, file_size_bytes, mime_type, upload_version, is_current)
         VALUES (?, ?, ?, ?, ?, ?, 1)`,
        [parseInt(registrationId), publicUrl, file.name, file.size, file.type || "application/octet-stream", nextVersion]
      );

      await connection.execute(
        'UPDATE Registration SET status = ? WHERE id = ?',
        ['PAYMENT_UPLOADED', parseInt(registrationId)]
      );

      await connection.commit();
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error: any) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

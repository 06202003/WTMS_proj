import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const { name, description, branch_id, status, reg_start, reg_end, event_date, categories } = data;

    const [result] = await db.execute(
      `INSERT INTO Tournament (name, description, branch_id, status, reg_start, reg_end, event_date, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [name, description, branch_id, status, new Date(reg_start), new Date(reg_end), new Date(event_date)]
    );

    const tournamentId = (result as any).insertId;

    if (categories && Array.isArray(categories)) {
      for (const cat of categories) {
        if (cat.name && cat.quota && cat.price !== undefined) {
          await db.execute(
            'INSERT INTO Category (name, quota, price, tournament_id) VALUES (?, ?, ?, ?)',
            [cat.name, cat.quota, cat.price, tournamentId]
          );
        }
      }
    }

    return NextResponse.json({ success: true, id: tournamentId });
  } catch (error: any) {
    console.error("Failed to create tournament", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    await db.execute(`ALTER TABLE Registration ADD COLUMN jersey_taken_p1 BOOLEAN DEFAULT FALSE;`);
    await db.execute(`ALTER TABLE Registration ADD COLUMN jersey_taken_p2 BOOLEAN DEFAULT FALSE;`);
    return NextResponse.json({ success: true, message: "Columns added successfully" });
  } catch (error: any) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      return NextResponse.json({ success: true, message: "Columns already exist" });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

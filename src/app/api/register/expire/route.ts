import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { registrationId } = await req.json();

    if (!registrationId) {
      return NextResponse.json({ error: "Missing registrationId" }, { status: 400 });
    }

    await db.execute(
      `UPDATE Registration SET status = 'EXPIRED' WHERE id = ? AND status = 'PENDING'`,
      [registrationId]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Expire Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

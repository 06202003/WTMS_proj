import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { registrationId, status, reason } = body;

    if (!registrationId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const qrCode = status === "APPROVED" ? `QR-WMD-${registrationId}-${Math.random().toString(36).substring(2, 8).toUpperCase()}` : null;

    if (status === "REJECTED" || status === "PAYMENT_REJECTED") {
      await db.execute(
        'UPDATE Registration SET status = ?, reject_reason = ? WHERE id = ?',
        [status, reason || null, parseInt(registrationId)]
      );
    } else if (qrCode) {
      await db.execute(
        'UPDATE Registration SET status = ?, qr_code = ?, reject_reason = NULL WHERE id = ?',
        [status, qrCode, parseInt(registrationId)]
      );
    } else {
      await db.execute(
        'UPDATE Registration SET status = ?, reject_reason = NULL WHERE id = ?',
        [status, parseInt(registrationId)]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Approve/Reject Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

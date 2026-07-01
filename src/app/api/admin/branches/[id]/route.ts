import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: paramId } = await context.params;
    const id = parseInt(paramId);
    const body = await req.json();
    const { name, location } = body;

    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    await db.execute(
      'UPDATE Branch SET name = ?, location = ? WHERE id = ?',
      [name, location || null, id]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: paramId } = await context.params;
    const id = parseInt(paramId);

    // Check if branch is in use
    const [tournaments] = await db.execute<any[]>('SELECT id FROM Tournament WHERE branch_id = ? LIMIT 1', [id]);
    if (tournaments.length > 0) {
      return NextResponse.json({ error: "Cannot delete branch. It is being used by one or more tournaments." }, { status: 400 });
    }

    await db.execute('DELETE FROM Branch WHERE id = ?', [id]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

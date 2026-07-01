import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const { name, description, branch_id, status, reg_start, reg_end, event_date, categories } = data;
    const { id: tournamentId } = await context.params;

    await db.execute(
      `UPDATE Tournament 
       SET name = ?, description = ?, branch_id = ?, status = ?, reg_start = ?, reg_end = ?, event_date = ?, updated_at = NOW() 
       WHERE id = ?`,
      [name, description, branch_id, status, new Date(reg_start), new Date(reg_end), new Date(event_date), tournamentId]
    );

    // Sync categories
    if (categories && Array.isArray(categories)) {
      const incomingIds = categories.filter(c => c.id).map(c => c.id);
      
      // Get existing categories
      const [existingCats] = await db.execute<any[]>('SELECT id FROM Category WHERE tournament_id = ?', [tournamentId]);
      const existingIds = existingCats.map(c => c.id);

      // Delete removed categories
      for (const id of existingIds) {
        if (!incomingIds.includes(id)) {
          try {
            await db.execute('DELETE FROM Category WHERE id = ?', [id]);
          } catch (e) {
            console.error("Could not delete category (might be in use):", id);
          }
        }
      }

      // Update or Insert
      for (const cat of categories) {
        if (cat.name && cat.quota && cat.price !== undefined) {
          if (cat.id) {
            await db.execute(
              'UPDATE Category SET name = ?, quota = ?, price = ? WHERE id = ?',
              [cat.name, cat.quota, cat.price, cat.id]
            );
          } else {
            await db.execute(
              'INSERT INTO Category (name, quota, price, tournament_id) VALUES (?, ?, ?, ?)',
              [cat.name, cat.quota, cat.price, tournamentId]
            );
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to update tournament", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    // First delete categories and registrations (if necessary) or let foreign keys handle it.
    // In our schema, foreign keys are ON DELETE CASCADE or RESTRICT depending on configuration.
    // It's safer to just delete the tournament if it's allowed.
    await db.execute("DELETE FROM Tournament WHERE id = ?", [id]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to delete tournament", error);
    // Might fail due to foreign key constraints if there are registrations
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return NextResponse.json({ error: "Cannot delete tournament because it has active registrations." }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

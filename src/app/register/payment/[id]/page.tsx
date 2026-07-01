import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import PaymentClient from "./page-client";

export default async function PaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const { id } = await params;
  const regId = parseInt(id);
  if (isNaN(regId)) return notFound();

  const [regRows] = await db.execute<RowDataPacket[]>(
    `SELECT r.id, r.status, r.submitted_at, c.price, c.name as category_name, t.name as tournament_name,
            TIMESTAMPDIFF(SECOND, NOW(), DATE_ADD(r.submitted_at, INTERVAL 30 MINUTE)) as seconds_left
     FROM Registration r
     JOIN Category c ON r.category_id = c.id
     JOIN Tournament t ON c.tournament_id = t.id
     WHERE r.id = ? AND r.user_id = ?`,
    [regId, parseInt(session.user.id)]
  );

  if (regRows.length === 0) return notFound();

  const registration = regRows[0];

  if (registration.status !== 'PENDING' && registration.status !== 'PAYMENT_REJECTED') {
    // If it's already paid or in another state, just redirect to dashboard
    redirect("/dashboard");
  }

  return (
    <PaymentClient 
      registration={{
        id: registration.id,
        tournamentName: registration.tournament_name,
        categoryName: registration.category_name,
        price: parseFloat(registration.price),
        secondsLeft: registration.seconds_left,
        status: registration.status
      }} 
    />
  );
}

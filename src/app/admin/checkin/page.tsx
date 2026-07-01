import CheckinClient from "./page-client";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function CheckinPage() {
  const session = await auth();
  if (!session?.user || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "SUPER_ADMIN")) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto p-4 md:p-8 w-full max-w-full">
      <CheckinClient />
    </div>
  );
}

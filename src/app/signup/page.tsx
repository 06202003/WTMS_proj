import SignupPageClient from "./page-client";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Memuat...</div>}>
      <SignupPageClient />
    </Suspense>
  );
}

import { Suspense } from "react";
import AdminClient from "./AdminClient";

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center">
          <p className="text-white/40">Loading admin...</p>
        </main>
      }
    >
      <AdminClient />
    </Suspense>
  );
}

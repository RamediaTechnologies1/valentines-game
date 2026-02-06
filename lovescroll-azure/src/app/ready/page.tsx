import { Suspense } from "react";
import ReadyClient from "./ReadyClient";

export default function ReadyPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-4">💕</div>
            <p className="text-white/50">Loading...</p>
          </div>
        </main>
      }
    >
      <ReadyClient />
    </Suspense>
  );
}

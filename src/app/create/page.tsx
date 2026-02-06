import { Suspense } from "react";
import CreateClient from "./CreateClient";

export default function CreatePage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-4">✨</div>
            <p className="text-white/50">Loading...</p>
          </div>
        </main>
      }
    >
      <CreateClient />
    </Suspense>
  );
}

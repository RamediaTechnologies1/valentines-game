import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-[#0a0a0a]">
      <div className="text-center max-w-md">
        <div className="text-5xl mb-6">💔</div>
        <h1
          className="text-3xl font-bold text-white mb-3"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Page not found
        </h1>
        <p className="text-white/40 text-sm mb-8">
          This page doesn&apos;t exist. But your love story could.
        </p>
        <Link
          href={process.env.NEXT_PUBLIC_WP_URL || "https://ramedia.com"}
          className="inline-block px-8 py-3.5 rounded-full font-semibold text-white transition-all hover:scale-105"
          style={{
            background: "linear-gradient(135deg, #f43f5e, #e11d48)",
          }}
        >
          Create a Love Experience 💕
        </Link>
      </div>
    </main>
  );
}

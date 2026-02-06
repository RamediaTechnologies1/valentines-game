"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

interface Experience {
  id: string;
  slug: string;
  tier: string;
  email: string;
  from_name: string;
  to_name: string;
  delivery_status: string;
  views: number;
  created_at: string;
  link_url: string;
  affiliate_code: string | null;
  affiliate_commission: number;
  status: string;
}

interface AffiliateStats {
  code: string;
  sales: number;
  revenue: number;
  commission: number;
}

const tierPrices: Record<string, number> = { lite: 19, classic: 49, forever: 99 };

export default function AdminClient() {
  const searchParams = useSearchParams();
  const secret = searchParams.get("secret");

  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin?secret=${secret}`);
      if (!res.ok) {
        setLoading(false);
        return;
      }
      const data = await res.json();
      setExperiences(data.experiences || []);
    } catch {
      console.error("Failed to load admin data");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (secret) loadData();
    else setLoading(false);
  }, [secret]);

  const handleRetry = async (id: string) => {
    setRetrying(id);
    await fetch("/api/send-delivery", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify({ experienceId: id }),
    });
    await loadData();
    setRetrying(null);
  };

  if (!secret) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <p className="text-white/30">Add ?secret=YOUR_SECRET to URL</p>
      </main>
    );
  }

  // Calculate stats
  const created = experiences.filter((e) => e.status === "created");
  const total = created.length;
  const revenue = created.reduce((sum, e) => sum + (tierPrices[e.tier] || 0), 0);
  const totalViews = created.reduce((sum, e) => sum + (e.views || 0), 0);
  const pending = created.filter((e) => e.delivery_status === "pending").length;
  const failed = created.filter((e) => e.delivery_status === "failed").length;
  const awaiting = experiences.filter((e) => e.status === "awaiting_creation").length;

  const byTier: Record<string, number> = {};
  created.forEach((e) => {
    byTier[e.tier] = (byTier[e.tier] || 0) + 1;
  });

  // Affiliate stats
  const affiliateMap = new Map<string, AffiliateStats>();
  created.forEach((e) => {
    if (e.affiliate_code) {
      const existing = affiliateMap.get(e.affiliate_code) || { code: e.affiliate_code, sales: 0, revenue: 0, commission: 0 };
      existing.sales += 1;
      existing.revenue += tierPrices[e.tier] || 0;
      existing.commission += e.affiliate_commission || 0;
      affiliateMap.set(e.affiliate_code, existing);
    }
  });
  const affiliates = Array.from(affiliateMap.values()).sort((a, b) => b.commission - a.commission);
  const totalCommission = affiliates.reduce((sum, a) => sum + a.commission, 0);

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-4 py-8 text-white">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
            LoveScroll Admin
          </h1>
          <button onClick={loadData} className="text-xs text-white/30 hover:text-white/60 transition" disabled={loading}>
            {loading ? "Loading..." : "↻ Refresh"}
          </button>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <StatCard label="Completed" value={total} />
          <StatCard label="Revenue" value={`$${revenue}`} />
          <StatCard label="Views" value={totalViews} />
          <StatCard label="Awaiting Creation" value={awaiting} />
          <StatCard label="Lite ($19)" value={byTier["lite"] || 0} />
          <StatCard label="Classic ($49)" value={byTier["classic"] || 0} />
          <StatCard label="Forever ($99)" value={byTier["forever"] || 0} />
          <StatCard label="Failed" value={failed} alert={failed > 0} />
        </div>

        {/* Affiliate section */}
        {affiliates.length > 0 && (
          <div className="rounded-xl border border-white/5 overflow-hidden mb-8">
            <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02] flex justify-between">
              <h2 className="text-white/60 text-sm font-medium">Affiliate Performance</h2>
              <span className="text-rose-400 text-sm font-semibold">${totalCommission.toFixed(2)} owed</span>
            </div>
            <div className="divide-y divide-white/5">
              {affiliates.map((aff) => (
                <div key={aff.code} className="px-4 py-3 flex items-center gap-4">
                  <span className="px-2 py-0.5 rounded bg-violet-500/10 text-violet-400 text-xs font-mono font-bold">{aff.code}</span>
                  <span className="text-white/20 text-xs flex-1 truncate">?ref={aff.code}</span>
                  <span className="text-white/40 text-xs">{aff.sales} sale{aff.sales !== 1 ? "s" : ""}</span>
                  <span className="text-white/40 text-xs">${aff.revenue} rev</span>
                  <span className="text-rose-400 text-sm font-semibold">${aff.commission.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Experiences table */}
        <div className="rounded-xl border border-white/5 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02]">
            <h2 className="text-white/60 text-sm font-medium">All Experiences ({experiences.length})</h2>
          </div>
          <div className="divide-y divide-white/5">
            {experiences.map((exp) => (
              <div key={exp.id} className="px-4 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                    exp.tier === "forever" ? "bg-amber-500/10 text-amber-400" :
                    exp.tier === "classic" ? "bg-rose-500/10 text-rose-400" :
                    "bg-white/5 text-white/40"
                  }`}>
                    {exp.tier}
                  </span>
                  <span className="text-white text-sm font-medium">
                    {exp.from_name || "—"} → {exp.to_name || "—"}
                  </span>
                  <span className={`ml-auto px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    exp.status === "awaiting_creation" ? "bg-blue-500/10 text-blue-400" :
                    exp.delivery_status === "sent" ? "bg-emerald-500/10 text-emerald-400" :
                    exp.delivery_status === "failed" ? "bg-red-500/10 text-red-400" :
                    exp.delivery_status === "pending" ? "bg-amber-500/10 text-amber-400" :
                    "bg-white/5 text-white/30"
                  }`}>
                    {exp.status === "awaiting_creation" ? "AWAITING" : exp.delivery_status}
                  </span>
                </div>
                <div className="text-white/20 text-xs flex items-center gap-2">
                  {exp.email} {exp.slug && `• ${exp.slug}`}
                  {exp.affiliate_code && (
                    <span className="px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-400 text-[9px] font-mono">ref:{exp.affiliate_code}</span>
                  )}
                  <span className="ml-auto">{exp.views || 0} views</span>
                  {exp.delivery_status === "failed" && (
                    <button
                      onClick={() => handleRetry(exp.id)}
                      className="text-rose-400 hover:text-rose-300 text-[10px] font-bold"
                      disabled={retrying === exp.id}
                    >
                      {retrying === exp.id ? "..." : "RETRY"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

function StatCard({ label, value, alert }: { label: string; value: string | number; alert?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${alert ? "border-red-500/20 bg-red-500/5" : "border-white/5 bg-white/[0.02]"}`}>
      <div className={`text-2xl font-bold ${alert ? "text-red-400" : "text-white"}`}>{value}</div>
      <div className="text-white/30 text-xs mt-1">{label}</div>
    </div>
  );
}

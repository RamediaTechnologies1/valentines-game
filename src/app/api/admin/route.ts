import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const experiences = await query(
      `SELECT id, slug, tier, email, from_name, to_name, delivery_status,
              delivery_time, express_delivery, views, created_at, link_url,
              affiliate_code, affiliate_commission, status
       FROM experiences ORDER BY created_at DESC LIMIT 50`
    );

    return NextResponse.json({ experiences });
  } catch (error) {
    console.error("Admin data error:", error);
    return NextResponse.json({ error: "Failed to load data" }, { status: 500 });
  }
}

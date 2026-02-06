import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const experience = await queryOne(
      `SELECT id, slug, tier, from_name, to_name, final_letter, photos, features,
              expires_at, created_at, views
       FROM experiences WHERE slug = $1 AND status = 'created'`,
      [slug]
    );

    if (!experience) {
      return NextResponse.json({ error: "Experience not found" }, { status: 404 });
    }

    const exp = experience as Record<string, unknown>;

    if (exp.expires_at && new Date(exp.expires_at as string) < new Date()) {
      return NextResponse.json({ error: "This experience has expired" }, { status: 410 });
    }

    // Increment views (fire and forget)
    query("UPDATE experiences SET views = views + 1 WHERE id = $1", [exp.id]).catch(() => {});

    return NextResponse.json(exp);
  } catch (error) {
    console.error("Fetch experience error:", error);
    return NextResponse.json({ error: "Failed to load experience" }, { status: 500 });
  }
}

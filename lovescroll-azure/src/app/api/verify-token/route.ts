import { NextRequest, NextResponse } from "next/server";
import { queryOne } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const experience = await queryOne<{
      id: string;
      tier: string;
      email: string;
      express_delivery: boolean;
      status: string;
      slug: string | null;
      features: Record<string, unknown>;
    }>(
      "SELECT id, tier, email, express_delivery, status, slug, features FROM experiences WHERE token = $1",
      [token]
    );

    if (!experience) {
      return NextResponse.json({ error: "Invalid token" }, { status: 404 });
    }

    if (experience.status === "created" && experience.slug) {
      return NextResponse.json(
        { error: "Experience already created", slug: experience.slug, alreadyUsed: true },
        { status: 409 }
      );
    }

    return NextResponse.json({
      valid: true,
      tier: experience.tier,
      email: experience.email,
      expressDelivery: experience.express_delivery,
      features: experience.features,
      token,
    });
  } catch (error) {
    console.error("Token verification error:", error);
    return NextResponse.json({ error: "Failed to verify token" }, { status: 500 });
  }
}

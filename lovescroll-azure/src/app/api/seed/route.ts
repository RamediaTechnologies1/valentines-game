import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { generateToken } from "@/lib/token";
import { APP_URL } from "@/lib/constants";

// GET /api/seed?secret=YOUR_ADMIN_SECRET
// Creates a demo experience so you can test the full UI
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Check if demo already exists
    const existing = await queryOne(
      "SELECT slug, token FROM experiences WHERE slug = 'demo-love-story'"
    );

    if (existing) {
      const exp = existing as { slug: string; token: string };
      return NextResponse.json({
        message: "Demo already exists",
        experienceUrl: `${APP_URL}/v/${exp.slug}`,
        createUrl: `${APP_URL}/create?token=${exp.token}`,
      });
    }

    const token = generateToken("demo-0");

    // Demo photos (placeholder images)
    const photos = [
      {
        url: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&h=600&fit=crop",
        caption: "The day we met — I knew you were something special ✨",
        order: 0,
      },
      {
        url: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=800&h=600&fit=crop",
        caption: "Our first adventure together 🌅",
        order: 1,
      },
      {
        url: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&h=600&fit=crop",
        caption: "This moment — I fell completely in love with you 💕",
        order: 2,
      },
    ];

    const finalLetter = `My dearest Emma,

Every moment with you feels like a gift I never expected to receive. From the very first time we talked, I knew there was something extraordinary about you.

You make ordinary days feel magical. Your laugh is my favorite sound. Your smile is the first thing I want to see every morning and the last thing I want to see every night.

Thank you for being you — for every silly joke, every deep conversation, every quiet moment together. I love every version of you.

Forever yours,
Jake 💕`;

    const features = {
      tier: "classic",
      maxPhotos: 7,
      reactionRecording: true,
      hostingDays: 180,
    };

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 180);

    await query(
      `INSERT INTO experiences (
        slug, token, woo_order_id, tier, email, from_name, to_name,
        final_letter, photos, features, delivery_status, link_url,
        expires_at, status, views
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'created', 0)`,
      [
        "demo-love-story",
        token,
        "demo-order-0",
        "classic",
        "demo@test.com",
        "Jake",
        "Emma",
        finalLetter,
        JSON.stringify(photos),
        JSON.stringify(features),
        "sent",
        `${APP_URL}/v/demo-love-story`,
        expiresAt.toISOString(),
      ]
    );

    return NextResponse.json({
      success: true,
      experienceUrl: `${APP_URL}/v/demo-love-story`,
      createUrl: `${APP_URL}/create?token=${token}`,
      adminUrl: `${APP_URL}/admin?secret=${secret}`,
      message: "Demo experience created! Open the experience URL to see the full flow.",
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Failed to seed", details: String(error) },
      { status: 500 }
    );
  }
}

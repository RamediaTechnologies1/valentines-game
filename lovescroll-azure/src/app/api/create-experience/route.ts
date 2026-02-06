import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { generateCoupleSlug } from "@/lib/slug";
import { APP_URL, DEFAULT_DELIVERY_DELAY, EXPRESS_DELIVERY_DELAY } from "@/lib/constants";

interface PhotoData {
  url: string;
  caption: string;
  order: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, fromName, toName, finalLetter, photos } = body as {
      token: string;
      fromName: string;
      toName: string;
      finalLetter: string;
      photos: PhotoData[];
    };

    if (!token || !fromName || !toName || !finalLetter || !photos?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify token and get experience
    const experience = await queryOne<{
      id: string;
      tier: string;
      express_delivery: boolean;
      features: { hostingDays?: number };
      status: string;
    }>(
      "SELECT id, tier, express_delivery, features, status FROM experiences WHERE token = $1",
      [token]
    );

    if (!experience) {
      return NextResponse.json({ error: "Invalid token" }, { status: 404 });
    }

    if (experience.status === "created") {
      return NextResponse.json({ error: "Experience already created" }, { status: 409 });
    }

    // Generate unique slug
    let slug = generateCoupleSlug(fromName, toName);
    let attempts = 0;
    while (attempts < 5) {
      const existing = await queryOne("SELECT id FROM experiences WHERE slug = $1", [slug]);
      if (!existing) break;
      slug = generateCoupleSlug(fromName, toName);
      attempts++;
    }

    // Delivery time
    const delayMinutes = experience.express_delivery ? EXPRESS_DELIVERY_DELAY : DEFAULT_DELIVERY_DELAY;
    const deliveryTime = new Date(Date.now() + delayMinutes * 60 * 1000);

    // Expiration
    const hostingDays = experience.features?.hostingDays || 30;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + hostingDays);

    const linkUrl = `${APP_URL}/v/${slug}`;

    // Update the experience
    await query(
      `UPDATE experiences SET
        slug = $1, from_name = $2, to_name = $3, final_letter = $4,
        photos = $5, link_url = $6, delivery_time = $7, expires_at = $8,
        delivery_status = 'pending', status = 'created', updated_at = NOW()
      WHERE id = $9`,
      [slug, fromName.trim(), toName.trim(), finalLetter.trim(), JSON.stringify(photos), linkUrl, deliveryTime.toISOString(), expiresAt.toISOString(), experience.id]
    );

    return NextResponse.json({ success: true, slug, linkUrl, deliveryTime: deliveryTime.toISOString() });
  } catch (error) {
    console.error("Create experience error:", error);
    return NextResponse.json({ error: "Failed to create experience" }, { status: 500 });
  }
}

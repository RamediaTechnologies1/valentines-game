import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { sendEmail } from "@/lib/gmail";
import { generateDeliveryEmail } from "@/lib/email-template";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const isAuthorized =
      authHeader === `Bearer ${process.env.CRON_SECRET}` ||
      authHeader === `Bearer ${process.env.ADMIN_SECRET}`;

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const specificId = (body as { experienceId?: string })?.experienceId;

    let rows;
    if (specificId) {
      rows = await query("SELECT * FROM experiences WHERE id = $1 AND delivery_status = 'pending'", [specificId]);
    } else {
      rows = await query("SELECT * FROM experiences WHERE delivery_status = 'pending' AND delivery_time <= NOW() LIMIT 20");
    }

    if (!rows?.length) {
      return NextResponse.json({ sent: 0, message: "No pending deliveries" });
    }

    const results = [];
    for (const exp of rows as Record<string, unknown>[]) {
      try {
        const { subject, html } = generateDeliveryEmail({
          toName: exp.to_name as string,
          fromName: exp.from_name as string,
          linkUrl: exp.link_url as string,
        });

        await sendEmail({ to: exp.email as string, subject, html });
        await query("UPDATE experiences SET delivery_status = 'sent', updated_at = NOW() WHERE id = $1", [exp.id]);
        results.push({ id: exp.id, slug: exp.slug, status: "sent" });
      } catch (emailError) {
        console.error(`Failed to send for ${exp.slug}:`, emailError);
        await query("UPDATE experiences SET delivery_status = 'failed', updated_at = NOW() WHERE id = $1", [exp.id]);
        results.push({ id: exp.id, slug: exp.slug, status: "failed" });
      }
    }

    return NextResponse.json({
      sent: results.filter((r) => r.status === "sent").length,
      failed: results.filter((r) => r.status === "failed").length,
      results,
    });
  } catch (error) {
    console.error("Send delivery error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return POST(new NextRequest(req.url, { method: "POST", headers: { authorization: authHeader || "" } }));
}

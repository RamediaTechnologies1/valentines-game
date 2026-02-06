import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { generateToken, verifyWooCommerceWebhook } from "@/lib/token";
import { getTierFeatures } from "@/lib/tiers";
import { sendEmail } from "@/lib/gmail";
import { APP_URL, AFFILIATE_COMMISSION_RATE } from "@/lib/constants";

function mapProductToTier(productName: string, sku?: string): string | null {
  if (sku) {
    const s = sku.toLowerCase();
    if (s.includes("forever")) return "forever";
    if (s.includes("classic")) return "classic";
    if (s.includes("lite")) return "lite";
  }
  const name = productName.toLowerCase();
  if (name.includes("forever")) return "forever";
  if (name.includes("classic")) return "classic";
  if (name.includes("lite")) return "lite";
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();

    // Verify webhook signature
    const signature = req.headers.get("x-wc-webhook-signature");
    if (signature && process.env.WOO_WEBHOOK_SECRET) {
      if (!verifyWooCommerceWebhook(rawBody, signature)) {
        console.error("Invalid WooCommerce webhook signature");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const order = JSON.parse(rawBody);

    // WooCommerce sends test pings
    const topic = req.headers.get("x-wc-webhook-topic");
    if (topic === "action.woocommerce_webhook_ping" || !order.id) {
      return NextResponse.json({ ok: true });
    }

    // Only process paid orders
    const status = order.status;
    if (status !== "completed" && status !== "processing") {
      return NextResponse.json({ ok: true, skipped: true });
    }

    // Duplicate check
    const existing = await queryOne(
      "SELECT id FROM experiences WHERE woo_order_id = $1",
      [String(order.id)]
    );
    if (existing) {
      return NextResponse.json({ ok: true, skipped: true, reason: "duplicate" });
    }

    // Extract tier from line items
    let tier = "lite";
    let hasExpress = false;
    for (const item of order.line_items || []) {
      const mapped = mapProductToTier(item.name, item.sku);
      if (mapped) tier = mapped;
      if (item.name?.toLowerCase().includes("express")) hasExpress = true;
    }

    // Customer info
    const email = order.billing?.email || "";
    const firstName = order.billing?.first_name || "";

    // Affiliate from coupon codes or order meta
    let affiliateCode: string | null = null;
    for (const coupon of order.coupon_lines || []) {
      affiliateCode = coupon.code;
    }
    for (const meta of order.meta_data || []) {
      if (meta.key === "affiliate_ref" || meta.key === "_affiliate_ref") {
        affiliateCode = meta.value;
      }
    }

    // Generate creation token
    const token = generateToken(String(order.id));

    // Features and commission
    const features = getTierFeatures(tier as "lite" | "classic" | "forever");
    const tierPrices: Record<string, number> = { lite: 19, classic: 49, forever: 99 };
    const commission = affiliateCode
      ? parseFloat((tierPrices[tier] * AFFILIATE_COMMISSION_RATE).toFixed(2))
      : 0;

    // Insert pending experience (awaiting creation by buyer)
    await query(
      `INSERT INTO experiences (
        token, woo_order_id, tier, email, features,
        express_delivery, affiliate_code, affiliate_commission,
        status, delivery_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'awaiting_creation', 'waiting')`,
      [token, String(order.id), tier, email, JSON.stringify(features), hasExpress, affiliateCode, commission]
    );

    // Email the buyer their creation link
    const createLink = `${APP_URL}/create?token=${token}`;
    const tierLabel = tier.charAt(0).toUpperCase() + tier.slice(1);

    await sendEmail({
      to: email,
      subject: "Create your LoveScroll experience 💕",
      html: `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Georgia,serif;">
  <table width="100%" style="background:#0a0a0a;padding:40px 20px;" cellpadding="0" cellspacing="0">
    <tr><td align="center">
      <table width="100%" style="max-width:480px;" cellpadding="0" cellspacing="0">
        <tr><td align="center" style="padding-bottom:20px;"><span style="font-size:28px;">✦</span></td></tr>
        <tr><td align="center" style="padding-bottom:8px;">
          <h1 style="margin:0;font-size:24px;color:#fff;">Thank you${firstName ? `, ${firstName}` : ""}!</h1>
        </td></tr>
        <tr><td align="center" style="padding-bottom:30px;">
          <p style="margin:0;font-size:15px;color:rgba(255,255,255,0.5);line-height:1.6;">
            Your LoveScroll <strong style="color:rgba(244,63,94,0.8);">${tierLabel}</strong> is ready to create.<br>
            Upload photos and write your love letter to build the experience.
          </p>
        </td></tr>
        <tr><td align="center" style="padding-bottom:30px;">
          <a href="${createLink}" style="display:inline-block;padding:16px 40px;background:linear-gradient(135deg,#f43f5e,#e11d48);color:#fff;text-decoration:none;font-size:16px;font-weight:bold;border-radius:50px;font-family:Arial,sans-serif;">
            Start Creating →
          </a>
        </td></tr>
        <tr><td align="center">
          <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.15);">
            This link is unique to your order. Don't share it.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`,
    });

    return NextResponse.json({ ok: true, token, tier, createLink });
  } catch (error) {
    console.error("WooCommerce webhook error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}

import crypto from "crypto";

// Generate a secure token for the creation link
export function generateToken(orderId: string): string {
  const payload = `${orderId}-${Date.now()}-${crypto.randomBytes(8).toString("hex")}`;
  const hash = crypto
    .createHash("sha256")
    .update(payload)
    .digest("hex")
    .slice(0, 24);
  return `ls_${hash}`;
}

// Verify WooCommerce webhook signature
export function verifyWooCommerceWebhook(
  payload: string,
  signature: string
): boolean {
  const secret = process.env.WOO_WEBHOOK_SECRET;
  if (!secret) return false;

  try {
    const computed = crypto
      .createHmac("sha256", secret)
      .update(payload, "utf8")
      .digest("base64");

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(computed)
    );
  } catch {
    return false;
  }
}

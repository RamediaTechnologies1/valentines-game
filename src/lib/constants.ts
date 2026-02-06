// Delivery timing (minutes)
export const DEFAULT_DELIVERY_DELAY = 30;
export const EXPRESS_DELIVERY_DELAY = 2;

// App URLs
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://ramedia.dev";
export const APP_DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || "ramedia.dev";
export const WP_URL = process.env.NEXT_PUBLIC_WP_URL || "https://ramedia.com";

// Company
export const COMPANY_NAME = "Ramedia";
export const COMPANY_URL = "https://ramedia.com";
export const COMPANY_EMAIL = "hello@ramedia.com";

// Photo limits
export const MAX_PHOTO_SIZE_MB = 10;
export const COMPRESSION_MAX_SIZE_MB = 2;
export const COMPRESSION_QUALITY = 0.8;

// Interactions (experience reveal types)
export const INTERACTION_TYPES = [
  "gift-box",
  "scratch-card",
  "heart-burst",
  "polaroid-drop",
  "envelope",
] as const;

export type InteractionType = (typeof INTERACTION_TYPES)[number];

// Affiliate
export const AFFILIATE_COMMISSION_RATE = 0.10; // 10%

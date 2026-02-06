export type TierName = "lite" | "classic" | "forever";

export interface TierConfig {
  name: TierName;
  label: string;
  price: number;
  maxPhotos: number;
  reactionRecording: boolean;
  allowSubdomain: boolean;
  hostingDays: number;
  description: string;
  features: string[];
}

export const TIERS: Record<TierName, TierConfig> = {
  lite: {
    name: "lite",
    label: "Lite",
    price: 19,
    maxPhotos: 3,
    reactionRecording: false,
    allowSubdomain: false,
    hostingDays: 30,
    description: "A sweet surprise for your love",
    features: [
      "3 photo memories",
      "Interactive scroll journey",
      "Personalized link",
      "Hosted for 30 days",
    ],
  },
  classic: {
    name: "classic",
    label: "Classic",
    price: 49,
    maxPhotos: 7,
    reactionRecording: true,
    allowSubdomain: false,
    hostingDays: 180,
    description: "The full love experience",
    features: [
      "7 photo memories",
      "Interactive scroll journey",
      "Side-by-side reaction recording",
      "Personalized link",
      "Hosted for 6 months",
    ],
  },
  forever: {
    name: "forever",
    label: "Forever",
    price: 99,
    maxPhotos: 10,
    reactionRecording: true,
    allowSubdomain: false,
    hostingDays: 365,
    description: "A love story that lasts",
    features: [
      "10 photo memories",
      "Interactive scroll journey",
      "Side-by-side reaction recording",
      "Priority delivery",
      "Hosted for 1 year",
    ],
  },
};

export const EXPRESS_DELIVERY_PRICE = 10;

export function getTierFeatures(tier: TierName) {
  return {
    tier,
    maxPhotos: TIERS[tier].maxPhotos,
    reactionRecording: TIERS[tier].reactionRecording,
    allowSubdomain: TIERS[tier].allowSubdomain,
    hostingDays: TIERS[tier].hostingDays,
  };
}

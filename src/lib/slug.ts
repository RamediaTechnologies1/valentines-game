const adjectives = [
  "lovely", "sweet", "tender", "golden", "starlit",
  "moonlit", "radiant", "eternal", "blissful", "cherished",
  "precious", "darling", "dreamy", "heavenly", "magical",
  "enchanted", "sparkling", "luminous", "glowing", "adored",
];

const nouns = [
  "heart", "rose", "kiss", "dream", "star",
  "flame", "wish", "bloom", "spark", "glow",
  "dawn", "light", "melody", "whisper", "charm",
  "bliss", "treasure", "memory", "moment", "promise",
];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDigits(length: number): string {
  return Array.from({ length }, () => Math.floor(Math.random() * 10)).join("");
}

/**
 * Generates a romantic, memorable slug like "starlit-rose-42"
 */
export function generateSlug(): string {
  const adj = randomFrom(adjectives);
  const noun = randomFrom(nouns);
  const digits = randomDigits(2);
  return `${adj}-${noun}-${digits}`;
}

/**
 * Generates a slug from couple names like "jake-and-emma-7x2"
 */
export function generateCoupleSlug(fromName: string, toName: string): string {
  const clean = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 10);
  const suffix = Math.random().toString(36).slice(2, 5);
  return `${clean(fromName)}-and-${clean(toName)}-${suffix}`;
}

/**
 * Browser-side helpers for the MOCK auth layer. Hashing here only keeps plain
 * passwords out of localStorage; it is not a substitute for server-side auth.
 */

const PASSWORD_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789"; // no 0/O, 1/l/I
const SYMBOLS = "#$%&*+?@";

function randomInts(count: number, max: number): number[] {
  const out: number[] = [];
  const buf = new Uint32Array(1);
  // Rejection sampling avoids modulo bias.
  const limit = Math.floor(0x1_0000_0000 / max) * max;
  while (out.length < count) {
    crypto.getRandomValues(buf);
    const n = buf[0]!;
    if (n < limit) out.push(n % max);
  }
  return out;
}

/** e.g. `Kp7x-Qm2R-hT9w#` — readable aloud, 12 random chars + a symbol. */
export function generatePassword(): string {
  const chars = randomInts(12, PASSWORD_ALPHABET.length).map((i) => PASSWORD_ALPHABET[i]);
  const symbol = SYMBOLS[randomInts(1, SYMBOLS.length)[0]!];
  return `${chars.slice(0, 4).join("")}-${chars.slice(4, 8).join("")}-${chars.slice(8).join("")}${symbol}`;
}

export function randomId(prefix: string): string {
  const bytes = crypto.getRandomValues(new Uint8Array(9));
  return `${prefix}_${Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")}`;
}

export const randomSalt = (): string => randomId("s");

export async function hashPassword(password: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Constant-time string comparison. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

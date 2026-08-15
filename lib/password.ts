import { scryptSync, randomBytes, timingSafeEqual } from "crypto";

/**
 * Password hashing utilities using Node's built-in scrypt.
 *
 * scrypt is deliberately chosen over bcrypt/argon2 to avoid adding a native
 * dependency. It is memory-hard and well-vetted (used by OpenBSD, Tarsnap).
 *
 * Hash format: `scrypt:${N}:${r}:${p}:${saltHex}:${hashHex}`
 * - N, r, p are the scrypt parameters (cost, block size, parallelism).
 * - saltHex is 32 bytes hex-encoded (64 chars).
 * - hashHex is 64 bytes hex-encoded (128 chars).
 *
 * The parameters are stored in the hash so they can be tuned later without
 * breaking existing hashes.
 */

const SCRYPT_N = 16384; // CPU/memory cost (must be a power of 2).
const SCRYPT_R = 8; // Block size.
const SCRYPT_P = 1; // Parallelism.
const KEY_LENGTH = 64; // Derived key length in bytes.
const SALT_LENGTH = 32; // Salt length in bytes.

/**
 * Hashes a plaintext password using scrypt with a random salt.
 * Returns the formatted hash string (store this in the database).
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(SALT_LENGTH);
  const hash = scryptSync(password, salt, KEY_LENGTH, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
  });
  return `scrypt:${SCRYPT_N}:${SCRYPT_R}:${SCRYPT_P}:${salt.toString("hex")}:${hash.toString("hex")}`;
}

/**
 * Verifies a plaintext password against a stored scrypt hash.
 * Uses timing-safe comparison to prevent timing attacks.
 * Returns true if the password matches, false otherwise.
 *
 * If the hash is malformed or uses an unknown algorithm, returns false
 * (fail-closed) rather than throwing.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(":");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;

  const N = Number(parts[1]);
  const r = Number(parts[2]);
  const p = Number(parts[3]);
  const salt = Buffer.from(parts[4], "hex");
  const expectedHash = Buffer.from(parts[5], "hex");

  if (!Number.isFinite(N) || !Number.isFinite(r) || !Number.isFinite(p)) {
    return false;
  }
  if (salt.length === 0 || expectedHash.length === 0) return false;

  try {
    const hash = scryptSync(password, salt, expectedHash.length, { N, r, p });
    return timingSafeEqual(hash, expectedHash);
  } catch {
    return false;
  }
}

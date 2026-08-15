#!/usr/bin/env node
/**
 * Bootstrap script to create the first named admin account.
 *
 * Usage:
 *   node scripts/create-admin.mjs
 *
 * Prompts for a username and password interactively (password is not echoed
 * to the terminal). Requires DATABASE_URL to be set in the environment or
 * .env.local.
 *
 * After creating the first admin, the ADMIN_SECRET fallback login is
 * automatically disabled (the login route only falls back to ADMIN_SECRET
 * when zero active admins exist).
 *
 * To create additional admins without this script, log in as an existing
 * admin and use the /admin/admins page.
 */

import { neon } from "@neondatabase/serverless";
import { scryptSync, randomBytes } from "node:crypto";
import { createInterface } from "node:readline";
import { createInterface as createReadline } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_LENGTH = 64;
const SALT_LENGTH = 32;

function hashPassword(password) {
  const salt = randomBytes(SALT_LENGTH);
  const hash = scryptSync(password, salt, KEY_LENGTH, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
  });
  return `scrypt:${SCRYPT_N}:${SCRYPT_R}:${SCRYPT_P}:${salt.toString("hex")}:${hash.toString("hex")}`;
}

async function readPassword() {
  // Read password without echoing. On Unix, use raw mode; on Windows,
  // fall back to echoing (the user can clear the terminal after).
  const rl = createReadline({ input, output });
  let password = "";

  if (process.stdin.isTTY && typeof process.stdin.setRawMode === "function") {
    // Unix-like: disable echo
    process.stdin.setRawMode(true);
    process.stdout.write("Password: ");
    return new Promise((resolve) => {
      process.stdin.resume();
      process.stdin.on("data", (data) => {
        for (const byte of data) {
          if (byte === 0x0d || byte === 0x0a) {
            // Enter
            process.stdin.setRawMode(false);
            process.stdin.pause();
            process.stdout.write("\n");
            resolve(password);
            return;
          }
          if (byte === 0x03) {
            // Ctrl-C
            process.exit(1);
          }
          if (byte === 0x7f || byte === 0x08) {
            // Backspace
            if (password.length > 0) {
              password = password.slice(0, -1);
              process.stdout.write("\b \b");
            }
            continue;
          }
          if (byte >= 0x20 && byte <= 0x7e) {
            password += String.fromCharCode(byte);
            process.stdout.write("*");
          }
        }
      });
    });
  } else {
    // Windows or non-TTY: just use readline (password will be visible)
    password = await rl.question("Password (will be visible): ");
    rl.close();
    return password;
  }
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("Error: DATABASE_URL is not set.");
    console.error("Set it in your environment or in .env.local, then run this script again.");
    process.exit(1);
  }

  const sql = neon(url);

  const rl = createReadline({ input, output });

  const username = (await rl.question("Username: ")).trim();
  if (!username || username.length < 3) {
    console.error("Username must be at least 3 characters.");
    process.exit(1);
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    console.error("Username may only contain letters, numbers, hyphens and underscores.");
    process.exit(1);
  }

  // Check if username already exists.
  const existing = await sql`
    SELECT id FROM admins WHERE username = ${username}
  `;
  if (existing.length > 0) {
    console.error(`Admin "${username}" already exists.`);
    process.exit(1);
  }

  rl.close();

  const password = await readPassword();
  if (!password || password.length < 12) {
    console.error("Password must be at least 12 characters.");
    process.exit(1);
  }

  const passwordHash = hashPassword(password);

  try {
    const rows = await sql`
      INSERT INTO admins (username, password_hash)
      VALUES (${username}, ${passwordHash})
      RETURNING id, username, created_at
    `;
    const admin = rows[0];
    console.log(`\nCreated admin "${admin.username}" (id #${admin.id}).`);
    console.log("You can now log in at /admin/login with this username and password.");
    console.log("The ADMIN_SECRET fallback login is now disabled (zero-admin fallback only applies when no admins exist).");
  } catch (error) {
    console.error("Failed to create admin:", error.message || error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Script failed:", error);
  process.exit(1);
});

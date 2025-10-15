import crypto from "crypto";

export function hashSha256(value) {
  return crypto.createHash("sha256").update(String(value)).digest("hex");
}



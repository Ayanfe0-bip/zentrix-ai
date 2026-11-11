import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from "node:crypto";

const ALGORITHM = "aes-256-gcm";

function getEncryptionKey(): Buffer {
  const hex = process.env.GITHUB_TOKEN_ENCRYPTION_KEY;

  if (!hex || !/^[a-f0-9]{64}$/i.test(hex)) {
    throw new Error(
      "GITHUB_TOKEN_ENCRYPTION_KEY is missing or invalid."
    );
  }

  return Buffer.from(hex, "hex");
}

export function encryptGitHubToken(token: string): string {
  const iv = randomBytes(12);

  const cipher = createCipheriv(
    ALGORITHM,
    getEncryptionKey(),
    iv
  );

  const encrypted = Buffer.concat([
    cipher.update(token, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return [
    iv.toString("hex"),
    authTag.toString("hex"),
    encrypted.toString("hex"),
  ].join(":");
}

export function decryptGitHubToken(payload: string): string {
  const parts = payload.split(":");

  if (parts.length !== 3) {
    throw new Error("Invalid encrypted GitHub token.");
  }

  const [ivHex, authTagHex, encryptedHex] = parts;

  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const encrypted = Buffer.from(encryptedHex, "hex");

  if (iv.length !== 12 || authTag.length !== 16) {
    throw new Error("Invalid encrypted GitHub token format.");
  }

  const decipher = createDecipheriv(
    ALGORITHM,
    getEncryptionKey(),
    iv
  );

  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

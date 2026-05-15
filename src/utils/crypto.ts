import * as crypto from 'crypto';

const ALGO = 'aes-256-gcm';

function getKeyFromEnv(): Buffer {
  const keyHex = process.env.ENCRYPTION_KEY;
  if (!keyHex) throw new Error('ENCRYPTION_KEY not set (must be 32 bytes hex)');
  const buf = Buffer.from(keyHex, 'hex');
  if (buf.length !== 32) throw new Error('ENCRYPTION_KEY must be 32 bytes (64 hex chars)');
  return buf;
}

export function encryptText(plain: string, key?: Buffer): string {
  const k = key ?? getKeyFromEnv();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, k, iv);
  const enc = Buffer.concat([cipher.update(Buffer.from(plain, 'utf8')), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${tag.toString('hex')}:${enc.toString('hex')}`;
}

export function decryptText(payload: string, key?: Buffer): string {
  const k = key ?? getKeyFromEnv();
  const parts = payload.split(':');
  if (parts.length !== 3) throw new Error('Invalid payload');
  const iv = Buffer.from(parts[0], 'hex');
  const tag = Buffer.from(parts[1], 'hex');
  const enc = Buffer.from(parts[2], 'hex');
  const decipher = crypto.createDecipheriv(ALGO, k, iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(enc), decipher.final()]);
  return dec.toString('utf8');
}

export { getKeyFromEnv };

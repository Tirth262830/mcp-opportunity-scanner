import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

const blockedHosts = new Set(["localhost", "metadata.google.internal"]);

export function normalizePublicUrl(value: string) {
  if (/^[a-z][a-z0-9+.-]*:/i.test(value) && !/^https?:\/\//i.test(value)) {
    throw new Error("Only HTTP and HTTPS URLs are supported.");
  }
  const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  const url = new URL(candidate);
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error("Only HTTP and HTTPS URLs are supported.");
  if (url.username || url.password) throw new Error("URLs with embedded credentials are not supported.");
  if (blockedHosts.has(url.hostname.toLowerCase()) || url.hostname.endsWith(".local")) {
    throw new Error("Local and private network addresses cannot be analyzed.");
  }
  return url;
}

function isPrivateIp(address: string) {
  if (!isIP(address)) return true;
  if (address.includes(':')) {
    const value = address.toLowerCase();
    return value === '::1' || value.startsWith('fc') || value.startsWith('fd') || value.startsWith('fe80:');
  }
  const parts = address.split('.').map(Number);
  return parts[0] === 10 || parts[0] === 127 || parts[0] === 0 ||
    (parts[0] === 169 && parts[1] === 254) ||
    (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
    (parts[0] === 192 && parts[1] === 168) || parts[0] >= 224;
}

export async function assertPublicHost(url: URL) {
  const records = await lookup(url.hostname, { all: true });
  if (!records.length || records.some(({ address }) => isPrivateIp(address))) {
    throw new Error("This hostname resolves to a private or unsafe network address.");
  }
}

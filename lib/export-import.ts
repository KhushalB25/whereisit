import type { InventoryItem } from "@/lib/types";

const CSV_HEADERS = [
  "name", "location", "roomCategory", "category",
  "quantity", "expiryDate", "dailyConsumptionRate",
  "consumptionIntervalDays", "notes", "status",
  "isPrivate", "itemType"
] as const;

export function exportToCSV(items: InventoryItem[]): string {
  const rows = items.map((item) => {
    const expiryDate = item.expiryDate
      ? new Date(item.expiryDate.seconds * 1000 || item.expiryDate.millis || 0).toISOString().split("T")[0]
      : "";

    return CSV_HEADERS.map((key) => {
      let val: unknown;
      if (key === "expiryDate") val = expiryDate;
      else if (key === "isPrivate") val = item.isPrivate ? "yes" : "no";
      else val = (item as Record<string, unknown>)[key] ?? "";
      return cell(String(val));
    }).join(",");
  });

  return [CSV_HEADERS.join(","), ...rows].join("\n");
}

function cell(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export type ImportRow = {
  name: string;
  location: string;
  roomCategory: string;
  category: string;
  quantity: number;
  expiryDate: string;
  dailyConsumptionRate: number;
  consumptionIntervalDays: number;
  notes: string;
  status: string;
  isPrivate: boolean;
  itemType: string;
};

export function parseImportCSV(text: string): ImportRow[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = parseLine(lines[0]).map((h) => h.trim().toLowerCase());
  const valid: ImportRow[] = [];
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const raw = parseLine(lines[i]);
    const row = Object.fromEntries(headers.map((h, idx) => [h, raw[idx] || ""])) as Record<string, string>;
    const name = row.name?.trim();
    if (!name) { errors.push(`Row ${i}: missing name`); continue; }
    valid.push({
      name,
      location: row.location || "",
      roomCategory: row.roomcategory || "Other",
      category: row.category || "Miscellaneous",
      quantity: Number(row.quantity) || 0,
      expiryDate: row.expirydate || "",
      dailyConsumptionRate: Number(row.dailyconsumptionrate) || 0,
      consumptionIntervalDays: Math.max(1, Number(row.consumptionintervaldays) || 1),
      notes: row.notes || "",
      status: row.status || "active",
      isPrivate: row.isprivate === "yes",
      itemType: row.itemtype || "inventory",
    });
  }

  return valid;
}

function parseLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (const ch of line) {
    if (ch === '"') { inQuotes = !inQuotes; continue; }
    if (ch === "," && !inQuotes) { result.push(current); current = ""; continue; }
    current += ch;
  }
  result.push(current);
  return result;
}

export function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── PIN-encrypted vault export ──

function toBuffer(data: Uint8Array): ArrayBuffer {
  return data.buffer instanceof ArrayBuffer ? data.buffer : data.slice().buffer;
}

function stringToUint8(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

function uint8ToString(buf: Uint8Array): string {
  return new TextDecoder().decode(buf);
}

function uint8ToHex(buf: Uint8Array): string {
  return Array.from(buf).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function hexToUint8(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  return bytes;
}

async function deriveKey(pin: string, salt: Uint8Array): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    toBuffer(stringToUint8(pin)),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: toBuffer(salt), iterations: 200_000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypt vault CSV content with the user's PIN.
 * Returns a hex-encoded string: salt(32 hex chars) + iv(24 hex chars) + ciphertext(hex).
 */
export async function encryptVaultCSV(csv: string, pin: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(pin, salt);
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: toBuffer(iv) },
    key,
    toBuffer(stringToUint8(csv))
  );
  return uint8ToHex(salt) + uint8ToHex(iv) + uint8ToHex(new Uint8Array(ciphertext));
}

/**
 * Decrypt vault CSV content that was encrypted with encryptVaultCSV.
 */
export async function decryptVaultCSV(hexData: string, pin: string): Promise<string> {
  const salt = hexToUint8(hexData.slice(0, 32));
  const iv = hexToUint8(hexData.slice(32, 56));
  const ciphertext = hexToUint8(hexData.slice(56));
  const key = await deriveKey(pin, salt);
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: toBuffer(iv) },
    key,
    toBuffer(ciphertext)
  );
  return uint8ToString(new Uint8Array(plaintext));
}

export function downloadEncryptedFile(hexData: string, filename: string) {
  const blob = new Blob([hexData], { type: "text/plain;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

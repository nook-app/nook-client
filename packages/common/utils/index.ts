import { createHash } from "crypto";

export function decodeCursorTimestamp(
  cursor?: string,
): { lt: Date } | undefined {
  if (!cursor) return;
  const decodedCursor = decodeCursor(cursor);
  return decodedCursor ? { lt: new Date(decodedCursor.timestamp) } : undefined;
}

export function decodeCursor(
  cursor?: string,
): Record<string, string> | undefined {
  if (!cursor) return;
  try {
    const decodedString = Buffer.from(cursor, "base64").toString("ascii");
    const decodedCursor = JSON.parse(decodedString);
    if (typeof decodedCursor === "object") {
      return decodedCursor;
    }
    console.error(
      "Decoded cursor does not match expected format:",
      decodedCursor,
    );
  } catch (error) {
    console.error("Error decoding cursor:", error);
  }
}

export function encodeCursor(
  cursor?: Record<string, string | number>,
): string | undefined {
  if (!cursor) return;
  const encodedString = JSON.stringify(cursor);
  return Buffer.from(encodedString).toString("base64");
}

export function hash(data: object): string {
  const json = JSON.stringify(data);
  const hash = createHash("md5").update(json).digest("hex");
  return hash;
}

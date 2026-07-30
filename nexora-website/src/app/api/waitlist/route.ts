import { createHash } from "crypto";
import { list, put } from "@vercel/blob";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let email = "";
  let name = "";
  try {
    const body = await request.json();
    email = String(body?.email || "").trim().toLowerCase();
    name = String(body?.name || "").trim();
  } catch {
    // fall through to validation error
  }

  if (!email || !EMAIL_RE.test(email)) {
    return Response.json({ error: "A valid email address is required" }, { status: 400 });
  }

  // Preferred: forward to the Nexora backend (Postgres waitlist table) when configured.
  const backendUrl =
    process.env.WAITLIST_BACKEND_URL ||
    (process.env.NODE_ENV !== "production" ? "http://localhost:5001" : "");

  if (backendUrl) {
    try {
      const res = await fetch(`${backendUrl}/api/waitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: name || undefined }),
      });
      const data = await res.json();
      return Response.json(data, { status: res.status });
    } catch {
      // Backend unreachable — fall back to Blob storage below if available.
    }
  }

  // Standalone mode: persist signups to a private Vercel Blob store.
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const key = `waitlist/${createHash("sha256").update(email).digest("hex")}.json`;

      const existing = await list({ prefix: key, limit: 1 });
      if (existing.blobs.length > 0) {
        return Response.json({ message: "You're already on the waitlist!", alreadyJoined: true });
      }

      await put(key, JSON.stringify({ email, name, joinedAt: new Date().toISOString() }), {
        access: "private",
        addRandomSuffix: false,
        contentType: "application/json",
      });

      return Response.json({
        message: "You're on the waitlist! We'll be in touch soon.",
        alreadyJoined: false,
      });
    } catch (err) {
      console.error("Waitlist blob storage error:", err);
      return Response.json({ error: "Something went wrong. Please try again." }, { status: 500 });
    }
  }

  return Response.json(
    { error: "Waitlist is not configured yet. Please try again later." },
    { status: 503 }
  );
}

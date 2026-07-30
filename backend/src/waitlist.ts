import { Router, Request, Response } from "express";
import pool from "./db";

/**
 * Waitlist API for the marketing site.
 *
 * Signups are ordered by insertion, and every signup gets a referral code.
 * Each person you refer moves you BOOST_PER_REFERRAL places up the queue, which
 * is what the landing page promises — the maths lives here so the promise and the
 * number shown to the user can't disagree.
 */

const router = Router();

const BOOST_PER_REFERRAL = 5;
const MAX_EMAIL_LENGTH = 320;
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no I/L/O/0/1
const CODE_LENGTH = 7;

// Deliberately strict but boring: one @, a dot in the domain, no whitespace.
const EMAIL_PATTERN = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

// The `waitlist` table is created by initDb() in db.ts alongside the rest of the schema.

// ── Helpers ───────────────────────────────────────────────────────────────────

const normalizeEmail = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  if (!email || email.length > MAX_EMAIL_LENGTH) return null;
  if (!EMAIL_PATTERN.test(email)) return null;
  return email;
};

const normalizeCode = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const code = value.trim().toUpperCase();
  if (!/^[A-Z0-9]{4,12}$/.test(code)) return null;
  return code;
};

const randomCode = () => {
  let out = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    out += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return out;
};

/** `yash.baing@gmail.com` → `ya***@gmail.com` */
const maskEmail = (email: string) => {
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  const head = local.slice(0, Math.min(2, local.length));
  return `${head}${"*".repeat(3)}@${domain}`;
};

type Row = {
  id: number;
  email: string;
  referral_code: string;
  referred_by: string | null;
};

const buildStatus = async (row: Row, revealEmail: boolean) => {
  const [rankRes, referralsRes, totalRes] = await Promise.all([
    pool.query<{ rank: string }>("SELECT COUNT(*)::text AS rank FROM waitlist WHERE id <= $1", [row.id]),
    pool.query<{ count: string }>(
      "SELECT COUNT(*)::text AS count FROM waitlist WHERE referred_by = $1",
      [row.referral_code]
    ),
    pool.query<{ count: string }>("SELECT COUNT(*)::text AS count FROM waitlist"),
  ]);

  const rank = parseInt(rankRes.rows[0]?.rank ?? "0", 10);
  const referrals = parseInt(referralsRes.rows[0]?.count ?? "0", 10);
  const total = parseInt(totalRes.rows[0]?.count ?? "0", 10);
  const boost = referrals * BOOST_PER_REFERRAL;

  return {
    email: revealEmail ? row.email : maskEmail(row.email),
    referralCode: row.referral_code,
    rank,
    referrals,
    boost,
    boostPerReferral: BOOST_PER_REFERRAL,
    position: Math.max(1, rank - boost),
    total,
  };
};

// ── Rate limiting ─────────────────────────────────────────────────────────────
// Fixed window, in memory. Enough to stop a bored visitor hammering the form;
// a real abuse problem would want something backed by the database.

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 8;
const buckets = new Map<string, { count: number; resetAt: number }>();

const rateLimited = (ip: string): boolean => {
  const now = Date.now();
  const bucket = buckets.get(ip);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    if (buckets.size > 5000) {
      for (const [key, value] of buckets) {
        if (value.resetAt < now) buckets.delete(key);
      }
    }
    return false;
  }

  bucket.count += 1;
  return bucket.count > MAX_PER_WINDOW;
};

const clientIp = (req: Request): string => {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || "unknown";
};

// ── Routes ────────────────────────────────────────────────────────────────────

router.get("/api/waitlist/stats", async (_req: Request, res: Response) => {
  try {
    const result = await pool.query<{ count: string }>("SELECT COUNT(*)::text AS count FROM waitlist");
    res.json({
      total: parseInt(result.rows[0]?.count ?? "0", 10),
      boostPerReferral: BOOST_PER_REFERRAL,
    });
  } catch (err: any) {
    console.error("❌ Waitlist stats failed:", err.message);
    res.status(503).json({ error: "Waitlist is temporarily unavailable" });
  }
});

router.get("/api/waitlist/me", async (req: Request, res: Response) => {
  const code = normalizeCode(req.query.code);
  if (!code) return res.status(400).json({ error: "A valid referral code is required" });

  try {
    const result = await pool.query<Row>(
      "SELECT id, email, referral_code, referred_by FROM waitlist WHERE referral_code = $1",
      [code]
    );
    const row = result.rows[0];
    if (!row) return res.status(404).json({ error: "No waitlist entry for that code" });

    res.json(await buildStatus(row, false));
  } catch (err: any) {
    console.error("❌ Waitlist lookup failed:", err.message);
    res.status(503).json({ error: "Waitlist is temporarily unavailable" });
  }
});

router.post("/api/waitlist", async (req: Request, res: Response) => {
  if (rateLimited(clientIp(req))) {
    return res.status(429).json({ error: "Too many attempts. Please try again in a minute." });
  }

  const email = normalizeEmail(req.body?.email);
  if (!email) {
    return res.status(400).json({ error: "Please enter a valid email address" });
  }

  const referredBy = normalizeCode(req.body?.ref);
  const source =
    typeof req.body?.source === "string" ? req.body.source.slice(0, 64) : "landing";

  try {
    const existing = await pool.query<Row>(
      "SELECT id, email, referral_code, referred_by FROM waitlist WHERE email = $1",
      [email]
    );

    if (existing.rows[0]) {
      const status = await buildStatus(existing.rows[0], true);
      return res.json({ ...status, alreadyJoined: true });
    }

    // Only credit a referral code that actually exists, and never one's own.
    let creditedBy: string | null = null;
    if (referredBy) {
      const referrer = await pool.query<{ email: string }>(
        "SELECT email FROM waitlist WHERE referral_code = $1",
        [referredBy]
      );
      if (referrer.rows[0] && referrer.rows[0].email !== email) creditedBy = referredBy;
    }

    // Retry on the (very unlikely) code collision.
    let inserted: Row | undefined;
    for (let attempt = 0; attempt < 6 && !inserted; attempt++) {
      try {
        const result = await pool.query<Row>(
          `INSERT INTO waitlist (email, referral_code, referred_by, source)
           VALUES ($1, $2, $3, $4)
           RETURNING id, email, referral_code, referred_by`,
          [email, randomCode(), creditedBy, source]
        );
        inserted = result.rows[0];
      } catch (err: any) {
        // 23505 = unique_violation. On email it means a concurrent signup won the race.
        if (err?.code !== "23505") throw err;
        if (typeof err.constraint === "string" && err.constraint.includes("email")) {
          const raced = await pool.query<Row>(
            "SELECT id, email, referral_code, referred_by FROM waitlist WHERE email = $1",
            [email]
          );
          if (raced.rows[0]) {
            const status = await buildStatus(raced.rows[0], true);
            return res.json({ ...status, alreadyJoined: true });
          }
        }
      }
    }

    if (!inserted) {
      return res.status(500).json({ error: "Could not reserve your place. Please try again." });
    }

    console.log(`📬 Waitlist signup #${inserted.id} (${maskEmail(email)}) source=${source}`);
    const status = await buildStatus(inserted, true);
    res.status(201).json({ ...status, alreadyJoined: false });
  } catch (err: any) {
    console.error("❌ Waitlist signup failed:", err.message);
    res.status(503).json({ error: "Waitlist is temporarily unavailable. Please try again shortly." });
  }
});

/** CSV export, enabled only when WAITLIST_ADMIN_TOKEN is configured. */
router.get("/api/waitlist/export", async (req: Request, res: Response) => {
  const adminToken = process.env.WAITLIST_ADMIN_TOKEN;
  if (!adminToken) return res.status(404).json({ error: "Not found" });

  const provided = req.headers.authorization?.replace(/^Bearer\s+/i, "") || req.query.token;
  if (provided !== adminToken) return res.status(401).json({ error: "Unauthorized" });

  try {
    const result = await pool.query<{
      id: number;
      email: string;
      referral_code: string;
      referred_by: string | null;
      source: string | null;
      created_at: Date;
    }>(
      `SELECT id, email, referral_code, referred_by, source, created_at
       FROM waitlist ORDER BY id ASC`
    );

    const escape = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const csv = [
      "rank,email,referral_code,referred_by,source,created_at",
      ...result.rows.map((row, index) =>
        [
          index + 1,
          escape(row.email),
          escape(row.referral_code),
          escape(row.referred_by),
          escape(row.source),
          escape(row.created_at.toISOString()),
        ].join(",")
      ),
    ].join("\n");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="nexora-waitlist.csv"');
    res.send(csv);
  } catch (err: any) {
    console.error("❌ Waitlist export failed:", err.message);
    res.status(503).json({ error: "Waitlist is temporarily unavailable" });
  }
});

export default router;

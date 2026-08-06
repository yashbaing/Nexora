const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5001";

export async function api<T = any>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data as T;
}

export { API };

export const DEMO_BUYERS = [
  { name: "Restaurant A", qty: 100, maxAED: 15000 },
  { name: "Restaurant B", qty: 180, maxAED: 27000 },
  { name: "Hotel C", qty: 250, maxAED: 38000 },
  { name: "Grocery D", qty: 130, maxAED: 20000 },
  { name: "Catering Company E", qty: 200, maxAED: 30000 },
];

export function fmtAED(n: number) {
  return `AED ${n.toLocaleString("en-AE", { maximumFractionDigits: 0 })}`;
}

export function fmtUSDC(n: string | number) {
  const v = typeof n === "string" ? Number(n) : n;
  return `${v.toLocaleString("en-US", { maximumFractionDigits: 2 })} USDC`;
}

export function fmtEURC(n: string | number) {
  const v = typeof n === "string" ? Number(n) : n;
  return `${v.toLocaleString("en-US", { maximumFractionDigits: 2 })} EURC`;
}

export function shortAddr(a?: string) {
  if (!a) return "—";
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

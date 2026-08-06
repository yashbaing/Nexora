import AppShell, { type Tab } from "./AppShell";

const VALID: Tab[] = ["orders", "mandate", "agent", "settlement", "receipt"];
const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5001";

async function fetchJson(path: string) {
  try {
    const res = await fetch(`${API}${path}`, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default async function AppPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const sp = await searchParams;
  const tab = (VALID.includes(sp.tab as Tab) ? sp.tab : "orders") as Tab;
  const [initialState, initialConfig] = await Promise.all([
    fetchJson("/api/demo/state"),
    fetchJson("/api/config"),
  ]);
  return (
    <AppShell
      initialTab={tab}
      initialState={initialState || { status: "idle", events: [], txs: [] }}
      initialConfig={initialConfig}
    />
  );
}

import AppShell, { type Tab } from "./AppShell";

const VALID: Tab[] = ["orders", "mandate", "agent", "settlement", "receipt"];

export default async function AppPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const sp = await searchParams;
  const tab = (VALID.includes(sp.tab as Tab) ? sp.tab : "orders") as Tab;
  return <AppShell initialTab={tab} />;
}

export interface TokenizedAsset {
  symbol: string;
  name: string;
  sector: string;
  region: "US" | "IN";
  price: number;
  changePercent: number;
}

// Mirrors backend/src/hyperliquid.ts STOCK_METADATA — kept in sync manually.
// changePercent values are illustrative starting deltas used purely for the
// animated marquee; the live app streams real numbers over WebSocket.
export const TOKENIZED_ASSETS: TokenizedAsset[] = [
  { symbol: "xAAPL", name: "Apple Inc.", sector: "Tech", region: "US", price: 314.96, changePercent: 1.24 },
  { symbol: "xTSLA", name: "Tesla Inc.", sector: "Auto", region: "US", price: 393.99, changePercent: -2.31 },
  { symbol: "xNVDA", name: "NVIDIA Corp.", sector: "Tech", region: "US", price: 207.4, changePercent: 3.87 },
  { symbol: "xMSFT", name: "Microsoft Corp.", sector: "Tech", region: "US", price: 385.66, changePercent: 0.62 },
  { symbol: "xGOOGL", name: "Alphabet Inc.", sector: "Tech", region: "US", price: 355.89, changePercent: 1.05 },
  { symbol: "xAMZN", name: "Amazon.com Inc.", sector: "Tech", region: "US", price: 185.0, changePercent: -0.44 },
  { symbol: "xMETA", name: "Meta Platforms", sector: "Tech", region: "US", price: 660.31, changePercent: 2.18 },
  { symbol: "xRELI", name: "Reliance Industries", sector: "Energy", region: "IN", price: 1297.0, changePercent: 0.91 },
  { symbol: "xTCS", name: "Tata Consultancy", sector: "Tech", region: "IN", price: 2069.0, changePercent: -1.12 },
  { symbol: "xJPM", name: "JPMorgan Chase", sector: "Finance", region: "US", price: 333.23, changePercent: 0.35 },
  { symbol: "xKO", name: "Coca-Cola Co.", sector: "Consumer", region: "US", price: 82.52, changePercent: 0.18 },
  { symbol: "xINFY", name: "Infosys Ltd.", sector: "Tech", region: "IN", price: 10.94, changePercent: 1.77 },
];

export interface Feature {
  icon: string;
  title: string;
  description: string;
}

export const FEATURES: Feature[] = [
  {
    icon: "Zap",
    title: "Instant Settlement",
    description:
      "Trades settle on Avalanche C-Chain in under two seconds. No T+2, no waiting — your position is yours the moment the block confirms.",
  },
  {
    icon: "PieChart",
    title: "Fractional Ownership",
    description:
      "Buy 0.001 of a share or a hundred. Every tokenized equity is fully divisible, so you invest exactly what you want to — not what a broker allows.",
  },
  {
    icon: "Globe2",
    title: "24/7 Global Markets",
    description:
      "Markets don't sleep and neither should your portfolio. Trade tokenized US and Indian equities around the clock, weekends included.",
  },
  {
    icon: "ShieldCheck",
    title: "Self-Custody, Always",
    description:
      "Your keys, your stocks. Assets live in your own wallet as ERC-20 tokens — Nexora never holds custody of your funds.",
  },
  {
    icon: "FileSignature",
    title: "Verifiable On-Chain Trades",
    description:
      "Every buy and sell is an EIP-712 signed, on-chain transaction you can audit yourself on a block explorer. No black boxes.",
  },
  {
    icon: "Wallet",
    title: "One-Click Onboarding",
    description:
      "Sign in with Google or connect any EIP-6963 wallet. We auto-provision a gas-funded wallet so you can start trading in seconds.",
  },
];

export interface Step {
  title: string;
  description: string;
}

export const STEPS: Step[] = [
  {
    title: "Join the waitlist",
    description: "Drop your email below to reserve your spot before public launch.",
  },
  {
    title: "Get your invite",
    description: "We onboard members in waves. You'll get an email the moment your access unlocks.",
  },
  {
    title: "Create your wallet",
    description: "Sign in with Google or connect your own wallet — a self-custody account is ready instantly.",
  },
  {
    title: "Start trading",
    description: "Deposit USDC and trade tokenized global equities on-chain, 24/7, from anywhere.",
  },
];

export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQS: FaqItem[] = [
  {
    question: "What is Nexora?",
    answer:
      "Nexora is a Web3 platform for trading tokenized equities — on-chain ERC-20 representations of real-world stocks like Apple, Tesla, and Reliance — settled instantly on the Avalanche C-Chain.",
  },
  {
    question: "What does 'tokenized stock' actually mean?",
    answer:
      "Each tokenized stock (like xAAPL) is a smart-contract-backed token whose price tracks the underlying equity in real time. Holding it in your wallet works like owning a fractional, freely transferable position — without a traditional brokerage account.",
  },
  {
    question: "Do I need to know crypto to use Nexora?",
    answer:
      "No. You can sign in with your Google account and we'll instantly generate a self-custody wallet for you behind the scenes. If you're already a Web3 user, you can connect MetaMask or any EIP-6963 compatible wallet instead.",
  },
  {
    question: "Is Nexora custodial?",
    answer:
      "Never. Nexora is non-custodial — assets are minted directly into your own wallet address and every trade is a transaction you (or your embedded wallet) sign. We can't freeze or move your funds.",
  },
  {
    question: "When does Nexora launch?",
    answer:
      "We're live on the Avalanche Fuji testnet today and onboarding waitlist members in waves ahead of mainnet launch. Join the waitlist to get early access and be notified the moment your invite is ready.",
  },
  {
    question: "Is there a cost to join the waitlist?",
    answer:
      "It's completely free. Just drop your email — no wallet connection or payment required to reserve your spot.",
  },
];

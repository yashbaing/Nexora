/**
 * Single source of truth for everything the marketing site says about Nexora.
 * Copy lives here so the landing page, secondary pages and OG images can't drift.
 */

export const site = {
  name: "Nexora",
  wordmark: "Nexora",
  tagline: "Tokenized equities, settled on-chain",
  description:
    "Nexora is a non-custodial Web3 equities platform. Buy fractional, tokenized shares of Apple, NVIDIA, Tesla and more — priced from live market feeds and settled in USDC on Avalanche.",
  shortDescription:
    "Buy fractional tokenized stocks with USDC on Avalanche. Non-custodial, 24/7, no brokerage account.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://nexora.finance",
  appPath: "/app",
  chain: "Avalanche",
  settlement: "USDC",
  oracle: "Hyperliquid",
  social: {
    x: "https://x.com",
    github: "https://github.com",
    telegram: "https://t.me",
    discord: "https://discord.com",
  },
} as const;

/**
 * Public facts about the current deployment. Mirrors `deployed-addresses.json`
 * at the repository root — update both together when contracts are redeployed.
 */
export const deployment = {
  network: "Avalanche Fuji Testnet",
  chainId: "43113",
  explorer: "https://testnet.snowtrace.io",
  platform: "0xf4d581d6974EDF49a8695D1a1aA3834FaB35D0ec",
  settlementToken: "0xa95D5F58f7bDDD29fb945655D17E359df2F27B1B",
  tokenStandard: "ERC-20 · 18 decimals",
  quoteScheme: "EIP-712 typed signature",
} as const;

export const pipeline = [
  {
    step: "Quote",
    body: "You enter an amount. The backend reads the current price from the live feed and returns a quote signed with EIP-712.",
  },
  {
    step: "Sign",
    body: "Your wallet signs one transaction carrying that quote. Nothing leaves your wallet until you approve it.",
  },
  {
    step: "Verify",
    body: "The platform contract recovers the oracle's address from the signature and rejects anything it didn't issue.",
  },
  {
    step: "Settle",
    body: "USDC moves out, equity tokens are minted in, and both legs land in the same transaction — atomically.",
  },
] as const;

export const navLinks = [
  { label: "Markets", href: "/markets" },
  { label: "How it works", href: "/how-it-works" },
  { label: "Technology", href: "/#technology" },
  { label: "FAQ", href: "/faq" },
] as const;

/** Headline nouns that rotate in the hero. */
export const heroRotators = ["Apple", "NVIDIA", "Tesla", "Microsoft", "Amazon", "Alphabet"] as const;

export const trustPoints = [
  "Non-custodial by design",
  "Live market-linked pricing",
  "Fractions from $1",
  "Open 24/7",
] as const;

export type Step = {
  n: string;
  title: string;
  body: string;
  detail: string;
};

export const steps: Step[] = [
  {
    n: "01",
    title: "Connect in one tap",
    body: "Bring your own wallet, or sign in with Google and Nexora provisions an embedded wallet for you. No brokerage forms, no waiting on approval.",
    detail: "Core Wallet · MetaMask · Rabby · Google",
  },
  {
    n: "02",
    title: "Fund with USDC",
    body: "Your buying power is a stablecoin balance you control. Nexora never takes custody of it, and you can withdraw to any address at any time.",
    detail: "USDC · 6 decimals · self-custodied",
  },
  {
    n: "03",
    title: "Buy the fraction you want",
    body: "Pick an equity token like xAAPL, enter an amount in dollars, and confirm. The trade prices against a live feed and settles as an on-chain transfer.",
    detail: "Signed quote · on-chain settlement",
  },
  {
    n: "04",
    title: "Hold it like any token",
    body: "Positions are ERC-20 balances in your own wallet. Track them in Nexora's portfolio view, or move them anywhere else — they're yours.",
    detail: "ERC-20 · portable · verifiable",
  },
];

export type Feature = {
  title: string;
  body: string;
  icon: string;
  span?: "wide" | "tall";
  stat?: string;
};

export const features: Feature[] = [
  {
    title: "Market-linked price feeds",
    body: "Every quote is anchored to a continuously streaming price feed, pushed to your screen over a websocket the moment it moves. No stale end-of-day marks.",
    icon: "activity",
    span: "wide",
    stat: "Sub-second updates",
  },
  {
    title: "You hold the keys",
    body: "Login is a signature, not a password. Balances live in your wallet, not on our balance sheet.",
    icon: "shield",
  },
  {
    title: "Oracle-signed quotes",
    body: "Each trade carries an EIP-712 signature from Nexora's price oracle, so the contract can verify the exact price you were shown.",
    icon: "signature",
  },
  {
    title: "Fractions, properly",
    body: "Equity tokens carry 18 decimals. Buy $4 of a $900 stock and own precisely 0.004444… of it.",
    icon: "scissors",
  },
  {
    title: "Candles and analytics",
    body: "1-minute through 1-day candlesticks, day range, volume and cost-basis P&L on every position.",
    icon: "candles",
  },
  {
    title: "One portfolio, many markets",
    body: "US megacaps and Indian large caps side by side, with allocation breakdowns by sector and region — and prices shown in the local currency of the listing.",
    icon: "globe",
    span: "wide",
    stat: "12 equities · 5 sectors · 2 regions",
  },
  {
    title: "Two ways in",
    body: "Connect any wallet your browser exposes, or sign in with Google and get an embedded wallet provisioned on the spot.",
    icon: "zap",
  },
];

export type Faq = { q: string; a: string };

export const faqs: Faq[] = [
  {
    q: "What exactly am I buying?",
    a: "An equity token — an ERC-20 token that tracks the price of a single listed company, one-to-one. xAAPL tracks Apple, xNVDA tracks NVIDIA. The token lives in your wallet and its balance is the size of your position. It is exposure to the price, not a share certificate: no voting rights and no dividend stream.",
  },
  {
    q: "Do I need a brokerage account?",
    a: "No. Nexora is not a broker and there is no account to open. You connect a wallet (or let us provision an embedded one from a Google sign-in), fund it with USDC, and trade. Nothing about the flow requires a traditional intermediary.",
  },
  {
    q: "Where is my money held?",
    a: "In your own wallet. Nexora is non-custodial: your USDC and your equity tokens sit at an address whose keys you control. When you trade, you sign a transaction that moves value directly between you and the platform contract. We cannot freeze, move or lend your balance.",
  },
  {
    q: "How are prices determined?",
    a: "Quotes are derived from a live, continuously streaming market feed rather than a periodic snapshot. When you request a trade, Nexora's oracle signs the exact price with an EIP-712 signature, and the on-chain contract will only execute against a price it can verify came from that signer.",
  },
  {
    q: "Can I trade outside market hours?",
    a: "The platform itself is open all the time — it is a smart contract, so it does not close for the weekend. Pricing follows the underlying feed, which is why we're candid that behaviour around closed sessions is one of the things we're testing carefully before launch.",
  },
  {
    q: "What chain does this run on?",
    a: "Avalanche. The platform contract, the mock USDC used in testing and each equity token are deployed and verifiable on-chain, so anyone can audit balances and trade history without asking us for a report.",
  },
  {
    q: "What are the fees?",
    a: "You pay the network's gas cost for your transaction, which on Avalanche is a fraction of a cent. Nexora's own fee schedule will be published in full before launch — we would rather state it once, accurately, than advertise a number we later revise.",
  },
  {
    q: "Is Nexora live yet?",
    a: "Nexora is running on testnet today while we harden the contracts and the pricing pipeline. The waitlist is how you get access first when mainnet opens, and how you get invited into the testnet cohort before that.",
  },
  {
    q: "What does joining the waitlist commit me to?",
    a: "Nothing. It reserves your place in line and gets you an early-access invite plus launch updates. One email address, no wallet connection, no payment details, and you can leave at any time.",
  },
];

export type RoadmapPhase = {
  phase: string;
  title: string;
  status: "done" | "active" | "next";
  points: string[];
};

export const roadmap: RoadmapPhase[] = [
  {
    phase: "Phase 01",
    title: "Contracts on testnet",
    status: "done",
    points: [
      "Platform, settlement and equity-token contracts deployed to Avalanche testnet",
      "Oracle-signed quote flow live end to end",
      "12 equity tokens minted across US and Indian listings",
    ],
  },
  {
    phase: "Phase 02",
    title: "Private beta",
    status: "active",
    points: [
      "Waitlist cohorts invited into the testnet app",
      "Portfolio analytics, candlesticks and watchlists",
      "Embedded wallets for Google sign-in",
    ],
  },
  {
    phase: "Phase 03",
    title: "Mainnet launch",
    status: "next",
    points: [
      "Third-party contract audit and published report",
      "Real USDC settlement with published fee schedule",
      "Limit orders and recurring buys",
    ],
  },
  {
    phase: "Phase 04",
    title: "Open platform",
    status: "next",
    points: [
      "Expanded listings across more regions",
      "Public API and SDK for programmatic access",
      "Mobile apps for iOS and Android",
    ],
  },
];

export const comparison = {
  columns: ["Nexora", "Traditional broker", "Centralised exchange"],
  rows: [
    { label: "Custody of your assets", values: ["You", "The broker", "The exchange"] },
    { label: "Time to first trade", values: ["Under a minute", "Days of onboarding", "Hours to verify"] },
    { label: "Minimum position", values: ["A dollar", "Often a whole share", "Varies"] },
    { label: "Settlement", values: ["On-chain, verifiable", "T+1, opaque", "Internal ledger"] },
    { label: "Platform hours", values: ["Always on", "Session hours", "Always on"] },
    { label: "Equity exposure", values: ["Yes", "Yes", "Rarely"] },
    { label: "Portable positions", values: ["Any wallet", "No", "No"] },
  ],
} as const;

export const stats = [
  { value: "12", label: "Tokenized equities", sub: "US & India listings" },
  { value: "18", label: "Token decimals", sub: "true fractional ownership" },
  { value: "<2s", label: "Block finality", sub: "on Avalanche" },
  { value: "0", label: "Assets we custody", sub: "non-custodial by design" },
] as const;

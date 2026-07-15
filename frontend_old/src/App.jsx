import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import {
  LineChart, Line, AreaChart, Area, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import {
  Home as HomeIcon, TrendingUp, Briefcase, Wallet as WalletIcon, User,
  Search, ArrowUpRight, ArrowDownRight, Bell, ChevronRight, ChevronLeft,
  CreditCard, Smartphone, Copy, Check, X, Plus,
  Shield, LogOut, Star, Eye, EyeOff,
  Globe, Lock, AlertCircle, Sparkles,
} from 'lucide-react';

const getBackendUrl = () => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5001';
  }
  return window.location.origin;
};
axios.defaults.baseURL = getBackendUrl();

/* ════════════════════════════════════════════════════════════════════
   PALETTE — clean white minimal
   ════════════════════════════════════════════════════════════════════ */
const C = {
  bg: '#ffffff',
  bg2: '#fafaf9',
  card: '#f5f5f4',
  cardHi: '#e7e5e4',
  border: '#e7e5e4',
  borderHi: '#d6d3d1',
  ink: '#0c0a09',
  inkDim: '#57534e',
  inkMute: '#a8a29e',
  accent: '#0c0a09',
  accentSoft: 'rgba(12, 10, 9, 0.06)',
  accentInk: '#ffffff',
  gain: '#16a34a',
  gainSoft: 'rgba(22, 163, 74, 0.08)',
  loss: '#dc2626',
  lossSoft: 'rgba(220, 38, 38, 0.08)',
  ember: '#ea580c',
  shellBg: '#e7e5e4',
};

const sans = { fontFamily: '"Geist", -apple-system, sans-serif' };
const serif = { fontFamily: '"Fraunces", "Instrument Serif", Georgia, serif', letterSpacing: '-0.025em', fontFeatureSettings: '"ss01", "ss02"' };
const mono = { fontFamily: '"JetBrains Mono", "SF Mono", monospace' };

/* ════════════════════════════════════════════════════════════════════
   MOCK DATA
   ════════════════════════════════════════════════════════════════════ */
const INITIAL_STOCKS = [
  { sym: 'xAAPL', name: 'Apple Inc.', sector: 'Tech', currency: 'USD', region: 'US', price: 291.13, change: -4.50, changePercent: -1.52, marketCap: '3.19T', volume: '42.1M', dayHigh: 291.13, dayLow: 291.13 },
  { sym: 'xTSLA', name: 'Tesla Inc.', sector: 'Auto', currency: 'USD', region: 'US', price: 406.43, change: 7.28, changePercent: 1.82, marketCap: '571B', volume: '88.4M', dayHigh: 406.43, dayLow: 406.43 },
  { sym: 'xNVDA', name: 'NVIDIA Corp.', sector: 'Tech', currency: 'USD', region: 'US', price: 205.19, change: 0.32, changePercent: 0.16, marketCap: '3.21T', volume: '196.2M', dayHigh: 205.19, dayLow: 205.19 },
  { sym: 'xMSFT', name: 'Microsoft Corp.', sector: 'Tech', currency: 'USD', region: 'US', price: 390.74, change: 0.40, changePercent: 0.10, marketCap: '3.37T', volume: '14.5M', dayHigh: 390.74, dayLow: 390.74 },
  { sym: 'xGOOGL', name: 'Alphabet Inc.', sector: 'Tech', currency: 'USD', region: 'US', price: 359.68, change: 1.91, changePercent: 0.53, marketCap: '1.98T', volume: '19.3M', dayHigh: 359.68, dayLow: 359.68 },
  { sym: 'xAMZN', name: 'Amazon.com Inc.', sector: 'Tech', currency: 'USD', region: 'US', price: 238.55, change: -2.96, changePercent: -1.23, marketCap: '2.21T', volume: '28.7M', dayHigh: 238.55, dayLow: 238.55 },
  { sym: 'xMETA', name: 'Meta Platforms', sector: 'Tech', currency: 'USD', region: 'US', price: 566.98, change: -1.45, changePercent: -0.26, marketCap: '1.51T', volume: '10.8M', dayHigh: 566.98, dayLow: 566.98 },
  { sym: 'xRELI', name: 'Reliance Industries', sector: 'Energy', currency: 'INR', region: 'IN', price: 1296.40, change: 33.40, changePercent: 2.64, marketCap: '19.5T', volume: '8.2M', dayHigh: 1296.40, dayLow: 1296.40 },
  { sym: 'xTCS', name: 'Tata Consultancy', sector: 'Tech', currency: 'INR', region: 'IN', price: 2161.10, change: 25.50, changePercent: 1.19, marketCap: '12.6T', volume: '2.1M', dayHigh: 2161.10, dayLow: 2161.10 },
  { sym: 'xJPM', name: 'JPMorgan Chase', sector: 'Finance', currency: 'USD', region: 'US', price: 320.72, change: 7.23, changePercent: 2.31, marketCap: '768B', volume: '7.2M', dayHigh: 320.72, dayLow: 320.72 },
  { sym: 'xKO', name: 'Coca-Cola Co.', sector: 'Consumer', currency: 'USD', region: 'US', price: 82.62, change: 0.09, changePercent: 0.11, marketCap: '311B', volume: '11.3M', dayHigh: 82.62, dayLow: 82.62 },
  { sym: 'xINFY', name: 'Infosys Ltd.', sector: 'Tech', currency: 'USD', region: 'US', price: 11.74, change: 0.14, changePercent: 1.21, marketCap: '72.7B', volume: '3.8M', dayHigh: 11.74, dayLow: 11.74 },
];
const HOLDINGS = [
  { sym: 'xNVDA', qty: 2.5, avgPrice: 89.00, currency: 'USD' },
  { sym: 'xAAPL', qty: 12.0, avgPrice: 198.40, currency: 'USD' },
  { sym: 'xTSLA', qty: 4.0, avgPrice: 210.00, currency: 'USD' },
  { sym: 'xRELI', qty: 1.8, avgPrice: 1260.00, currency: 'INR' },
];
const USD_INR = 84.5;
const TXNS = [
  { type: 'deposit', method: 'UPI', amount: 25000, when: 'Today, 09:42' },
  { type: 'buy', symbol: 'xNVDA', amount: 1894.22, qty: 0.5, when: 'Yesterday' },
  { type: 'deposit', method: 'USDC', amount: 500, when: '2d ago' },
  { type: 'sell', symbol: 'xMSFT', amount: 825.34, qty: 2.0, when: '3d ago' },
  { type: 'deposit', method: 'Visa', amount: 1000, when: 'Last week' },
];

const seriesFor = (sym, currentPrice, points = 60) => {
  let seed = sym.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const rng = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  const base = currentPrice || 100;
  const out = []; let p = base * 0.92;
  for (let i = 0; i < points; i++) {
    p += (rng() - 0.48) * (base * 0.018);
    out.push({ i, v: +p.toFixed(2) });
  }
  out[points - 1].v = base;
  return out;
};
const portfolioSeries = (finalValue) => {
  let seed = 1337;
  const rng = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  const out = []; let v = finalValue * 0.85;
  for (let i = 0; i < 30; i++) { v += (rng() - 0.42) * (finalValue * 0.012); out.push({ i, v: Math.round(v) }); }
  out[out.length - 1].v = Math.round(finalValue);
  return out;
};
const fmtINR = n => '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 2 });
const fmtUSD = n => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtPrice = (price, currency) => currency === 'INR' ? fmtINR(price) : fmtUSD(price);

/* Multi-currency: rates are USD-based (1 USD = X) */
const CURRENCIES = {
  USD: { symbol: '$', rate: 1, locale: 'en-US', flag: '🇺🇸', name: 'US Dollar' },
  INR: { symbol: '₹', rate: 84.50, locale: 'en-IN', flag: '🇮🇳', name: 'Indian Rupee' },
  EUR: { symbol: '€', rate: 0.92, locale: 'de-DE', flag: '🇪🇺', name: 'Euro' },
  GBP: { symbol: '£', rate: 0.79, locale: 'en-GB', flag: '🇬🇧', name: 'British Pound' },
  JPY: { symbol: '¥', rate: 156.80, locale: 'ja-JP', flag: '🇯🇵', name: 'Japanese Yen' },
  AED: { symbol: 'د.إ', rate: 3.67, locale: 'en-AE', flag: '🇦🇪', name: 'UAE Dirham' },
};
const fmt = (usdAmount, code = 'USD') => {
  const c = CURRENCIES[code] || CURRENCIES.USD;
  const v = usdAmount * c.rate;
  const decimals = code === 'JPY' ? 0 : 2;
  return c.symbol + v.toLocaleString(c.locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

/* ════════════════════════════════════════════════════════════════════
   PRIMITIVES
   ════════════════════════════════════════════════════════════════════ */
const Sparkline = ({ data, up, w = 56, h = 22 }) => (
  <ResponsiveContainer width={w} height={h}>
    <LineChart data={data}>
      <Line type="monotone" dataKey="v" stroke={up ? C.gain : C.loss} strokeWidth={1.5}
        dot={false} isAnimationActive={false} />
    </LineChart>
  </ResponsiveContainer>
);

const Pill = ({ children, active, onClick }) => (
  <button onClick={onClick} type="button" style={{
    padding: '8px 16px', borderRadius: 999,
    border: `1px solid ${active ? C.ink : C.border}`,
    background: active ? C.ink : 'transparent',
    color: active ? C.bg : C.inkDim,
    fontSize: 12, fontWeight: 500, letterSpacing: '0.02em',
    transition: 'all .15s', whiteSpace: 'nowrap',
    cursor: 'pointer',
  }}>{children}</button>
);

const Delta = ({ value, big = false, withSign = true }) => {
  const up = value >= 0;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      color: up ? C.gain : C.loss,
      fontSize: big ? 14 : 11, fontWeight: 600, ...mono,
    }}>
      {up ? '▲' : '▼'} {withSign && up ? '+' : ''}{value.toFixed(2)}%
    </span>
  );
};

const Header = ({ title, eyebrow, onBack, right }) => (
  <div style={{
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
    padding: '24px 22px 18px', position: 'sticky', top: 0, zIndex: 10,
    background: `linear-gradient(to bottom, ${C.bg} 88%, ${C.bg}f0 100%)`,
    backdropFilter: 'blur(8px)',
  }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
      {onBack && (
        <button onClick={onBack} type="button" style={{
          width: 36, height: 36, borderRadius: 12,
          background: C.card, border: `1px solid ${C.border}`,
          display: 'grid', placeItems: 'center', color: C.ink, marginTop: 4,
          cursor: 'pointer',
        }}><ChevronLeft size={18} /></button>
      )}
      <div>
        {eyebrow && <div style={{ fontSize: 10, color: C.inkMute, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 4, fontWeight: 600 }}>{eyebrow}</div>}
        <div style={{ ...serif, fontSize: 30, color: C.ink, lineHeight: 1, fontWeight: 400 }}>{title}</div>
      </div>
    </div>
    {right}
  </div>
);

const TickerTape = ({ stocks }) => {
  const items = stocks.slice(0, 8);
  return (
    <div style={{
      borderTop: `1px solid ${C.border}`,
      borderBottom: `1px solid ${C.border}`,
      overflow: 'hidden', position: 'relative', background: C.bg2,
    }}>
      <div style={{
        display: 'flex', gap: 28, padding: '10px 0',
        animation: 'tickerScroll 38s linear infinite',
        whiteSpace: 'nowrap', width: 'max-content',
      }}>
        {[...items, ...items, ...items].map((s, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, ...mono, fontSize: 11 }}>
            <span style={{ color: C.inkDim }}>{s.sym}</span>
            <span style={{ color: C.ink }}>{fmtPrice(s.price, s.currency)}</span>
            <span style={{ color: (s.changePercent ?? s.change) >= 0 ? C.gain : C.loss }}>
              {(s.changePercent ?? s.change) >= 0 ? '+' : ''}{(s.changePercent ?? s.change).toFixed(2)}%
            </span>
            <span style={{ color: C.inkMute }}>·</span>
          </span>
        ))}
      </div>
    </div>
  );
};

const Row = ({ label, val, valColor, bold }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between',
    padding: '12px 0', borderBottom: `1px solid ${C.border}`,
    fontSize: bold ? 14 : 12,
    color: bold ? C.ink : C.inkDim, fontWeight: bold ? 600 : 400,
  }}>
    <span>{label}</span>
    <span style={{ ...mono, color: valColor || C.ink, fontWeight: 500 }}>{val}</span>
  </div>
);

const Field = ({ label, children }) => (
  <div style={{ marginBottom: 16 }}>
    <div style={{ fontSize: 10, color: C.inkMute, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 6, fontWeight: 600 }}>
      {label}
    </div>
    {children}
  </div>
);

/* ════════════════════════════════════════════════════════════════════
   HOME
   ════════════════════════════════════════════════════════════════════ */
const HomeScreen = ({ go, openTrade, balanceVisible, setBalanceVisible, stocks, holdings, cashBalance, transactions }) => {
  const movers = stocks.slice(0, 4);

  // Real portfolio value in INR (convert USD holdings, keep INR holdings)
  const portfolioINR = holdings.reduce((sum, h) => {
    const s = stocks.find(x => x.sym === h.sym);
    if (!s) return sum;
    return sum + h.qty * (s.currency === 'INR' ? s.price : s.price * USD_INR);
  }, 0);
  const costINR = holdings.reduce((sum, h) => {
    return sum + h.qty * (h.currency === 'INR' ? h.avgPrice : h.avgPrice * USD_INR);
  }, 0);
  const cashINR = cashBalance;
  const total = portfolioINR + cashINR;
  const change = costINR > 0 ? ((portfolioINR - costINR) / costINR) * 100 : 0;

  const data = useMemo(() => portfolioSeries(total), [total]);

  return (
    <>
      <Header
        title="Aarav."
        eyebrow="Saturday, 09 May"
        right={
          <button type="button" style={{
            width: 36, height: 36, borderRadius: 12,
            background: C.card, border: `1px solid ${C.border}`,
            display: 'grid', placeItems: 'center', color: C.ink,
            position: 'relative', marginTop: 4, cursor: 'pointer',
          }}>
            <Bell size={16} />
            <span style={{ position: 'absolute', top: 8, right: 8, width: 6, height: 6, borderRadius: 999, background: C.loss }} />
          </button>
        }
      />
      <TickerTape stocks={stocks} />
      <div style={{ padding: '24px 22px 24px' }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ fontSize: 11, color: C.inkMute, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600 }}>
              Net worth
            </div>
            <button type="button" onClick={() => setBalanceVisible(!balanceVisible)} style={{ color: C.inkMute, fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
              {balanceVisible ? <Eye size={12} /> : <EyeOff size={12} />}
              {balanceVisible ? 'Hide' : 'Show'}
            </button>
          </div>
          <div style={{ ...serif, fontSize: 64, color: C.ink, lineHeight: 0.95, marginTop: 12, marginBottom: 4, letterSpacing: '-0.04em' }}>
            {balanceVisible ? fmtINR(total) : '••••••'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Delta value={change} big />
            <span style={{ fontSize: 11, color: C.inkMute, letterSpacing: '0.04em' }}>
              <span style={{ color: change >= 0 ? C.gain : C.loss, ...mono }}>
                {change >= 0 ? '+' : '−'}{fmtINR(Math.abs(portfolioINR - costINR))}
              </span>{' '}all-time P&amp;L
            </span>
          </div>
          <div style={{ height: 96, marginLeft: -22, marginRight: -22, marginTop: 18 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="hg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C.ink} stopOpacity={0.18} />
                    <stop offset="100%" stopColor={C.ink} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="v" stroke={C.ink} strokeWidth={1.6}
                  fill="url(#hg)" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 8, marginBottom: 32 }}>
          <button type="button" onClick={() => go('deposit')} style={{
            padding: '14px', background: C.ink, color: C.bg,
            borderRadius: 14, fontSize: 13, fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            cursor: 'pointer', border: 'none',
          }}>
            <Plus size={14} strokeWidth={2.5} /> Deposit
          </button>
          <button type="button" onClick={() => go('markets')} style={{
            padding: '14px', background: C.bg, color: C.ink,
            border: `1px solid ${C.border}`, borderRadius: 14,
            fontSize: 13, fontWeight: 500, cursor: 'pointer',
          }}>Trade</button>
          <button type="button" style={{
            padding: '14px', background: C.bg, color: C.ink,
            border: `1px solid ${C.border}`, borderRadius: 14,
            fontSize: 13, fontWeight: 500, cursor: 'pointer',
          }}>Send</button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
          <h3 style={{ ...serif, fontSize: 22, color: C.ink, margin: 0, fontWeight: 400 }}>Movers</h3>
          <button type="button" onClick={() => go('markets')} style={{
            fontSize: 11, color: C.ink, letterSpacing: '0.08em', textTransform: 'uppercase',
            display: 'flex', alignItems: 'center', gap: 2, fontWeight: 600,
            cursor: 'pointer', background: 'none', border: 'none',
          }}>All markets <ChevronRight size={11} /></button>
        </div>
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', margin: '0 -22px', padding: '4px 22px 4px', scrollbarWidth: 'none' }}>
          {movers.map(s => (
            <button key={s.sym} type="button" onClick={() => openTrade(s)} style={{
              minWidth: 168, background: C.bg, border: `1px solid ${C.border}`,
              borderRadius: 18, padding: 16, textAlign: 'left',
              transition: 'all .2s', cursor: 'pointer',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div>
                  <div style={{ ...mono, fontSize: 11, color: C.inkDim, marginBottom: 2, fontWeight: 500 }}>{s.sym}</div>
                  <div style={{ fontSize: 11, color: C.inkMute, lineHeight: 1.2 }}>{s.name.split(' ')[0]}</div>
                </div>
                <Sparkline data={seriesFor(s.sym, 20)} up={(s.changePercent ?? s.change) >= 0} />
              </div>
              <div style={{ ...serif, fontSize: 26, color: C.ink, lineHeight: 1, marginBottom: 4 }}>
                {fmtPrice(s.price, s.currency)}
              </div>
              <Delta value={s.changePercent ?? s.change} />
            </button>
          ))}
        </div>

        <div style={{ marginTop: 32 }}>
          <h3 style={{ ...serif, fontSize: 22, color: C.ink, margin: '0 0 14px', fontWeight: 400 }}>Activity</h3>
          {((transactions && transactions.length > 0) ? transactions : TXNS).slice(0, 4).map((tx, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', padding: '14px 0',
              borderBottom: i < 3 ? `1px solid ${C.border}` : 'none',
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: 12,
                background: tx.type === 'deposit' ? C.gainSoft : tx.type === 'buy' ? C.accentSoft : C.lossSoft,
                color: tx.type === 'deposit' ? C.gain : tx.type === 'buy' ? C.ink : C.loss,
                display: 'grid', placeItems: 'center', marginRight: 14,
              }}>
                {tx.type === 'deposit' ? <Plus size={16} strokeWidth={2} /> :
                  tx.type === 'buy' ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, color: C.ink, fontWeight: 500 }}>
                  {tx.type === 'deposit' ? `${tx.method} deposit` :
                    tx.type === 'buy' ? `Bought ${tx.symbol}` : `Sold ${tx.symbol}`}
                </div>
                <div style={{ fontSize: 11, color: C.inkMute, marginTop: 3 }}>{tx.when}</div>
              </div>
              <div style={{ ...mono, fontSize: 13, color: C.ink, fontWeight: 500 }}>
                {tx.type === 'deposit' && tx.method !== 'USDC' ? fmtINR(tx.amount) : fmtUSD(tx.amount)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

/* ════════════════════════════════════════════════════════════════════
   MARKETS
   ════════════════════════════════════════════════════════════════════ */
const MarketsScreen = ({ openTrade, onBack, stocks }) => {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const filters = ['All', 'Tech', 'Finance', 'Auto', 'Energy', 'Consumer'];
  const list = stocks.filter(s =>
    (filter === 'All' || s.sector === filter) &&
    (s.sym.toLowerCase().includes(query.toLowerCase()) || s.name.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <>
      <Header title="Markets" eyebrow="Tokenized equities · live" onBack={onBack} />
      <div style={{ padding: '0 22px 24px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: C.card, border: `1px solid ${C.border}`, borderRadius: 14,
          padding: '14px 16px', marginBottom: 16,
        }}>
          <Search size={16} color={C.inkMute} />
          <input
            value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search by ticker or name"
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: C.ink, fontSize: 14, ...sans,
            }}
          />
          <kbd style={{
            ...mono, fontSize: 10, color: C.inkMute, padding: '2px 6px',
            border: `1px solid ${C.border}`, borderRadius: 5,
          }}>⌘K</kbd>
        </div>

        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', margin: '0 -22px', padding: '0 22px 18px', scrollbarWidth: 'none' }}>
          {filters.map(f => <Pill key={f} active={filter === f} onClick={() => setFilter(f)}>{f}</Pill>)}
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: '40px 1fr 64px 90px',
          gap: 12, padding: '0 4px 8px',
          fontSize: 9, color: C.inkMute, letterSpacing: '0.18em', textTransform: 'uppercase',
          borderBottom: `1px solid ${C.border}`, marginBottom: 4, fontWeight: 600,
        }}>
          <span></span><span>Token</span><span style={{ textAlign: 'right' }}>7d</span><span style={{ textAlign: 'right' }}>Price</span>
        </div>

        <div>
          {list.map((s, i) => (
            <button key={s.sym} type="button" onClick={() => openTrade(s)} style={{
              display: 'grid', gridTemplateColumns: '40px 1fr 64px 90px', alignItems: 'center', gap: 12,
              width: '100%', padding: '14px 4px',
              background: 'transparent',
              borderBottom: i < list.length - 1 ? `1px solid ${C.border}` : 'none',
              textAlign: 'left', cursor: 'pointer', border: 'none',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: C.card, border: `1px solid ${C.border}`,
                display: 'grid', placeItems: 'center',
                color: C.ink, ...serif, fontSize: 16, fontWeight: 500,
              }}>{s.sym.charAt(1)}</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 14, color: C.ink, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {s.name}
                  </span>
                  {s.region === 'IN' && (
                    <span style={{ fontSize: 9, color: C.inkMute, padding: '1px 5px', border: `1px solid ${C.border}`, borderRadius: 4, ...mono, fontWeight: 600 }}>IN</span>
                  )}
                </div>
                <div style={{ ...mono, fontSize: 11, color: C.inkMute, marginTop: 2 }}>{s.sym} · {s.sector}</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Sparkline data={seriesFor(s.sym, 20)} up={s.change >= 0} />
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ ...mono, fontSize: 13, color: C.ink, fontWeight: 500 }}>{fmtPrice(s.price, s.currency)}</div>
                <div style={{ marginTop: 3 }}><Delta value={s.changePercent ?? s.change} /></div>
              </div>
            </button>
          ))}
          {list.length === 0 && (
            <div style={{ textAlign: 'center', color: C.inkMute, padding: 50, fontSize: 13 }}>
              No tokens match.
            </div>
          )}
        </div>
      </div>
    </>
  );
};

/* ════════════════════════════════════════════════════════════════════
   STOCK DETAIL — buy/sell bar OUTSIDE scroll (rendered at app level)
   ════════════════════════════════════════════════════════════════════ */
const StockDetailScreen = ({ stock, onBack, holdings }) => {
  const [range, setRange] = useState('1M');
  const ranges = ['1D', '1W', '1M', '1Y', 'ALL'];
  const points = { '1D': 24, '1W': 30, '1M': 60, '1Y': 120, 'ALL': 200 }[range];
  const data = useMemo(() => seriesFor(stock.sym, stock.price, points), [stock.sym, stock.price, range]);
  const holding = holdings.find(h => h.sym === stock.sym);

  return (
    <>
      <Header
        title={stock.sym} eyebrow={stock.name}
        onBack={onBack}
        right={
          <button type="button" style={{
            width: 36, height: 36, borderRadius: 12,
            background: C.card, border: `1px solid ${C.border}`,
            display: 'grid', placeItems: 'center', color: C.ink, marginTop: 4,
            cursor: 'pointer',
          }}><Star size={15} /></button>
        }
      />
      <div style={{ padding: '0 22px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 6 }}>
          <div style={{ ...serif, fontSize: 56, color: C.ink, lineHeight: 1, letterSpacing: '-0.04em' }}>
            {fmtPrice(stock.price, stock.currency)}
          </div>
          <div style={{ textAlign: 'right' }}>
            <Delta value={stock.changePercent ?? stock.change} big />
            <div style={{ ...mono, fontSize: 10, color: C.inkMute, marginTop: 2 }}>last 24h</div>
          </div>
        </div>

        <div style={{ height: 220, marginLeft: -22, marginRight: -22, marginTop: 18 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="dg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={stock.change >= 0 ? C.gain : C.loss} stopOpacity={0.22} />
                  <stop offset="100%" stopColor={stock.change >= 0 ? C.gain : C.loss} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v"
                stroke={stock.change >= 0 ? C.gain : C.loss} strokeWidth={1.8}
                fill="url(#dg)" isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, padding: 4, background: C.card, borderRadius: 12, border: `1px solid ${C.border}` }}>
          {ranges.map(r => (
            <button key={r} type="button" onClick={() => setRange(r)} style={{
              flex: 1, padding: '8px 0', fontSize: 11, fontWeight: 600,
              color: range === r ? C.bg : C.inkDim,
              background: range === r ? C.ink : 'transparent',
              borderRadius: 8, ...mono, transition: 'all .2s',
              border: 'none', cursor: 'pointer',
            }}>{r}</button>
          ))}
        </div>

        {holding && (
          <div style={{
            marginTop: 26, padding: 18, borderRadius: 16,
            background: C.card, border: `1px solid ${C.border}`,
          }}>
            <div style={{ fontSize: 10, color: C.inkMute, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 14, fontWeight: 600 }}>
              Your position
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, rowGap: 16 }}>
              <div>
                <div style={{ fontSize: 10, color: C.inkMute, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4, fontWeight: 600 }}>Holdings</div>
                <div style={{ ...serif, fontSize: 26, color: C.ink, lineHeight: 1 }}>{holding.qty}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: C.inkMute, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4, fontWeight: 600 }}>Value</div>
                <div style={{ ...serif, fontSize: 26, color: C.ink, lineHeight: 1 }}>{fmtPrice(holding.qty * stock.price, stock.currency)}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: C.inkMute, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4, fontWeight: 600 }}>Avg cost</div>
                <div style={{ ...mono, fontSize: 14, color: C.ink, fontWeight: 500 }}>{fmtPrice(holding.avgPrice, stock.currency)}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: C.inkMute, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4, fontWeight: 600 }}>P&amp;L</div>
                <div style={{ marginTop: 2 }}><Delta value={((stock.price - holding.avgPrice) / holding.avgPrice) * 100} big /></div>
              </div>
            </div>
          </div>
        )}

        <div style={{ marginTop: 26 }}>
          <h3 style={{ ...serif, fontSize: 20, color: C.ink, margin: '0 0 14px', fontWeight: 400 }}>About</h3>
          <div>
            {[
              ['Sector', stock.sector],
              ['Market cap', stock.marketCap || 'N/A'],
              ['24h volume', stock.volume || 'N/A'],
              ['Day high', fmtPrice(stock.dayHigh || stock.price, stock.currency)],
              ['Day low', fmtPrice(stock.dayLow || stock.price, stock.currency)],
              ['Token standard', 'ERC-20'],
              ['Backing', '1:1 underlying equity'],
            ].map(([k, v], i, arr) => (
              <div key={k} style={{
                display: 'flex', justifyContent: 'space-between', padding: '14px 0',
                borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : 'none',
              }}>
                <span style={{ fontSize: 13, color: C.inkMute }}>{k}</span>
                <span style={{ fontSize: 13, color: C.ink, ...mono, fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

/* ════════════════════════════════════════════════════════════════════
   PORTFOLIO — with currency chip selector
   ════════════════════════════════════════════════════════════════════ */
const PortfolioScreen = ({ openTrade, onBack, stocks, holdings }) => {
  const [ccy, setCcy] = useState('USD');
  // Normalize all values to USD so the multi-currency total works correctly
  const enriched = holdings.map(h => {
    const s = stocks.find(x => x.sym === h.sym);
    if (!s) return { ...h, valueUSD: 0, pnl: 0 };
    const priceUSD = s.currency === 'INR' ? s.price / USD_INR : s.price;
    const avgUSD = h.currency === 'INR' ? h.avgPrice / USD_INR : h.avgPrice;
    const valueUSD = h.qty * priceUSD;
    const pnl = ((priceUSD - avgUSD) / avgUSD) * 100;
    return { ...h, ...s, priceUSD, avgUSD, valueUSD, value: valueUSD, pnl };
  });
  const total = enriched.reduce((a, h) => a + (h.valueUSD || 0), 0);
  const totalCost = enriched.reduce((a, h) => a + h.qty * (h.avgUSD || h.avgPrice), 0);
  const totalPnl = totalCost > 0 ? ((total - totalCost) / totalCost) * 100 : 0;
  const colors = [C.ink, C.gain, C.ember, '#7c3aed'];
  const cInfo = CURRENCIES[ccy];

  return (
    <>
      <Header title="Portfolio" eyebrow="4 holdings · diversified" onBack={onBack} />
      <div style={{ padding: '0 22px 24px' }}>
        {/* CURRENCY CHIPS — prominent */}
        <div style={{ marginBottom: 22 }}>
          <div style={{
            fontSize: 10, color: C.inkMute, letterSpacing: '0.18em',
            textTransform: 'uppercase', marginBottom: 10, fontWeight: 600,
          }}>
            Display currency
          </div>
          <div style={{
            display: 'flex', gap: 6, overflowX: 'auto',
            margin: '0 -22px', padding: '2px 22px 4px',
            scrollbarWidth: 'none',
          }}>
            {Object.entries(CURRENCIES).map(([code, info]) => {
              const active = ccy === code;
              return (
                <button key={code} type="button" onClick={() => setCcy(code)} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '9px 14px', borderRadius: 999,
                  background: active ? C.ink : C.bg,
                  border: `1px solid ${active ? C.ink : C.border}`,
                  color: active ? C.bg : C.ink,
                  fontSize: 12, fontWeight: 600, ...mono,
                  letterSpacing: '0.04em', whiteSpace: 'nowrap',
                  flexShrink: 0, transition: 'all .15s', cursor: 'pointer',
                }}>
                  <span style={{ fontSize: 14 }}>{info.flag}</span>
                  {code}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ marginBottom: 26 }}>
          <div style={{
            fontSize: 10, color: C.inkMute, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 10,
            display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600,
          }}>
            Total value · <span style={{ color: C.ink, ...mono }}>{ccy}</span>
          </div>
          <div style={{ ...serif, fontSize: 48, color: C.ink, lineHeight: 0.95, letterSpacing: '-0.04em' }}>
            {fmt(total, ccy)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
            <Delta value={totalPnl} big />
            <span style={{ fontSize: 11, color: C.inkMute }}>
              <span style={{ ...mono, color: totalPnl >= 0 ? C.gain : C.loss }}>
                {totalPnl >= 0 ? '+' : '−'}{fmt(Math.abs(total - totalCost), ccy)}
              </span> all-time
            </span>
          </div>
          {ccy !== 'USD' && (
            <div style={{ ...mono, fontSize: 10, color: C.inkMute, marginTop: 8, letterSpacing: '0.04em' }}>
              ≈ {fmtUSD(total)} · 1 USD = {cInfo.symbol}{cInfo.rate.toFixed(2)} {ccy}
            </div>
          )}
        </div>

        <div style={{
          padding: 18, background: C.card, border: `1px solid ${C.border}`,
          borderRadius: 16, display: 'flex', alignItems: 'center', gap: 18, marginBottom: 26,
        }}>
          <div style={{ width: 110, height: 110, flexShrink: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={enriched} dataKey="value" innerRadius={36} outerRadius={52}
                  paddingAngle={2} stroke="none" isAnimationActive={false}>
                  {enriched.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, color: C.inkMute, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 10, fontWeight: 600 }}>Allocation</div>
            {enriched.map((h, i) => (
              <div key={h.sym} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, marginBottom: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: colors[i % colors.length] }} />
                <span style={{ ...mono, color: C.inkDim, flex: 1 }}>{h.sym}</span>
                <span style={{ ...mono, color: C.ink, fontWeight: 500 }}>{((h.value / total) * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>

        <h3 style={{ ...serif, fontSize: 22, color: C.ink, margin: '0 0 14px', fontWeight: 400 }}>Holdings</h3>
        <div>
          {enriched.map((h, i) => (
            <button key={h.sym} type="button" onClick={() => openTrade(h)} style={{
              display: 'flex', alignItems: 'center', padding: '16px 0',
              background: 'transparent', width: '100%',
              borderBottom: i < enriched.length - 1 ? `1px solid ${C.border}` : 'none',
              textAlign: 'left', cursor: 'pointer', border: 'none',
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: C.card, border: `1px solid ${C.border}`,
                display: 'grid', placeItems: 'center',
                color: C.ink, ...serif, fontSize: 16, marginRight: 14,
              }}>{h.sym.charAt(1)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, color: C.ink, fontWeight: 500 }}>{h.name}</div>
                <div style={{ ...mono, fontSize: 11, color: C.inkMute, marginTop: 3 }}>
                  {h.qty} · avg {fmtPrice(h.avgPrice, h.currency)}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ ...mono, fontSize: 13, color: C.ink, fontWeight: 500 }}>{fmt(h.valueUSD || h.value, ccy)}</div>
                <div style={{ marginTop: 3 }}><Delta value={h.pnl} /></div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

/* ════════════════════════════════════════════════════════════════════
   WALLET
   ════════════════════════════════════════════════════════════════════ */
const WalletScreen = ({ go, onBack, cashBalance, web3Wallet, transactions, setSelectedSymbol, setTradeSide }) => {
  const balances = [
    { ccy: 'INR', amount: cashBalance, sub: 'Indian Rupee · Cash' },
    { ccy: 'USDC', amount: web3Wallet?.balances?.USDC || 0, sub: 'USD Coin · Ethereum Web3' },
    { ccy: 'ETH', amount: web3Wallet?.balances?.ETH || 0, sub: 'Ethereum · Web3 Native' },
  ];
  return (
    <>
      <Header title="Wallet" eyebrow="3 currencies" onBack={onBack} />
      <div style={{ padding: '0 22px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 22 }}>
          <button type="button" onClick={() => go('deposit')} style={{
            padding: '16px',
            background: C.ink, color: C.bg,
            borderRadius: 14, fontSize: 13, fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            cursor: 'pointer', border: 'none',
          }}>
            <Plus size={15} strokeWidth={2.5} /> Add money
          </button>
          <button type="button" onClick={() => {
            setSelectedSymbol('xAAPL');
            setTradeSide('buy');
          }} style={{
            padding: '16px',
            background: 'rgba(255, 0, 128, 0.08)', color: '#ff0080',
            border: '1px solid rgba(255, 0, 128, 0.15)',
            borderRadius: 14, fontSize: 13, fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            cursor: 'pointer',
          }}>
            <Sparkles size={15} strokeWidth={2.5} /> Swap DEX
          </button>
        </div>

        <div style={{ fontSize: 10, color: C.inkMute, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 12, fontWeight: 600 }}>
          Balances
        </div>
        {balances.map((b, i) => (
          <div key={b.ccy} style={{
            display: 'flex', alignItems: 'center', padding: '16px 0',
            borderBottom: i < balances.length - 1 ? `1px solid ${C.border}` : 'none',
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: b.ccy === 'USDC' || b.ccy === 'ETH' ? 'rgba(255, 0, 128, 0.04)' : C.card,
              border: `1px solid ${b.ccy === 'USDC' || b.ccy === 'ETH' ? 'rgba(255, 0, 128, 0.1)' : C.border}`,
              display: 'grid', placeItems: 'center',
              ...serif, fontSize: 13, color: b.ccy === 'USDC' || b.ccy === 'ETH' ? '#ff0080' : C.ink, marginRight: 14, fontWeight: 500,
            }}>{b.ccy}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, color: C.ink, fontWeight: 500 }}>{b.ccy}</div>
              <div style={{ fontSize: 11, color: C.inkMute, marginTop: 3 }}>{b.sub}</div>
            </div>
            <div style={{ ...serif, fontSize: 22, color: b.amount > 0 ? C.ink : C.inkMute }}>
              {b.ccy === 'INR' ? fmtINR(b.amount) : b.ccy === 'ETH' ? `${b.amount.toFixed(4)} ETH` : fmtUSD(b.amount)}
            </div>
          </div>
        ))}

        <div style={{ fontSize: 10, color: C.inkMute, letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 28, marginBottom: 12, fontWeight: 600 }}>
          Transactions
        </div>
        {transactions.map((tx, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', padding: '14px 0',
            borderBottom: i < transactions.length - 1 ? `1px solid ${C.border}` : 'none',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 12,
              background: tx.type === 'deposit' ? C.gainSoft :
                tx.type === 'swap' ? 'rgba(255, 0, 128, 0.08)' :
                  tx.type === 'buy' ? C.accentSoft : C.lossSoft,
              color: tx.type === 'deposit' ? C.gain :
                tx.type === 'swap' ? '#ff0080' :
                  tx.type === 'buy' ? C.ink : C.loss,
              display: 'grid', placeItems: 'center', marginRight: 14,
            }}>
              {tx.type === 'deposit' ? <Plus size={16} /> :
                tx.type === 'swap' ? <Sparkles size={16} /> :
                  tx.type === 'buy' ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: C.ink }}>
                {tx.type === 'deposit' ? `${tx.method} deposit` :
                  tx.type === 'swap' ? `Uniswap Swap` :
                    tx.type === 'buy' ? `Bought ${tx.symbol}` : `Sold ${tx.symbol}`}
              </div>
              <div style={{ fontSize: 11, color: C.inkMute, marginTop: 3 }}>
                {tx.type === 'swap' ? `${tx.inputToken} ➔ ${tx.outputToken}` : tx.when}
              </div>
            </div>
            <div style={{ ...mono, fontSize: 13, color: C.ink, fontWeight: 500, textAlign: 'right' }}>
              {tx.type === 'deposit' && tx.method !== 'USDC' && tx.method !== 'ETH' ? fmtINR(tx.amount) :
                tx.type === 'swap' ? `${parseFloat(tx.outputAmount).toFixed(2)} ${tx.outputToken}` :
                  tx.type === 'buy' || tx.type === 'sell' ? `${parseFloat(tx.qty).toFixed(2)} ${tx.symbol}` :
                    fmtUSD(tx.amount)}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

/* ════════════════════════════════════════════════════════════════════
   DEPOSIT FLOWS
   ════════════════════════════════════════════════════════════════════ */
const DepositMethodScreen = ({ go, onBack }) => {
  const methods = [
    {
      id: 'upi', name: 'UPI', tag: 'India',
      icon: <Smartphone size={20} />,
      desc: 'GPay · PhonePe · Paytm', detail: 'Instant · zero fee · ₹100 min',
      hue: C.ink
    },
    {
      id: 'crypto', name: 'Crypto', tag: 'Global',
      icon: <Globe size={20} />,
      desc: 'USDC · USDT · BTC · ETH', detail: 'On-chain · network fees apply',
      hue: C.gain
    },
    {
      id: 'card', name: 'Visa / Mastercard', tag: 'Card',
      icon: <CreditCard size={20} />,
      desc: 'Debit & credit', detail: 'Instant · 1.5% fee',
      hue: C.ember
    },
  ];
  return (
    <>
      <Header title="Add money" eyebrow="Choose a method" onBack={onBack} />
      <div style={{ padding: '0 22px 24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {methods.map(m => (
            <button key={m.id} type="button" onClick={() => go('deposit-' + m.id)} style={{
              display: 'flex', alignItems: 'center', padding: 18,
              background: C.bg, border: `1px solid ${C.border}`,
              borderRadius: 18, textAlign: 'left',
              transition: 'all .2s', position: 'relative', overflow: 'hidden',
              cursor: 'pointer',
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: m.hue + '15', color: m.hue,
                display: 'grid', placeItems: 'center', marginRight: 16, flexShrink: 0,
              }}>{m.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  <span style={{ ...serif, fontSize: 18, color: C.ink, fontWeight: 400 }}>{m.name}</span>
                  <span style={{ fontSize: 9, color: m.hue, padding: '2px 6px', background: m.hue + '12', borderRadius: 4, ...mono, letterSpacing: '0.06em', fontWeight: 600 }}>
                    {m.tag.toUpperCase()}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: C.inkDim, marginBottom: 3 }}>{m.desc}</div>
                <div style={{ fontSize: 10, color: C.inkMute, ...mono }}>{m.detail}</div>
              </div>
              <ChevronRight size={18} color={C.inkMute} />
            </button>
          ))}
        </div>

        <div style={{
          marginTop: 26, padding: 16, borderRadius: 14,
          background: C.bg2, border: `1px dashed ${C.border}`,
          display: 'flex', gap: 12,
        }}>
          <Shield size={16} color={C.inkMute} style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ fontSize: 12, color: C.inkDim, lineHeight: 1.55 }}>
            All deposits are protected by 2-factor authentication and processed by licensed payment partners.
          </div>
        </div>
      </div>
    </>
  );
};

const DepositUPIScreen = ({ onBack }) => {
  const [amount, setAmount] = useState('');
  const [app, setApp] = useState('gpay');
  const [paying, setPaying] = useState(false);
  const apps = [
    { id: 'gpay', name: 'Google Pay' },
    { id: 'phonepe', name: 'PhonePe' },
    { id: 'paytm', name: 'Paytm' },
    { id: 'other', name: 'Other UPI' },
  ];
  const presets = [500, 2000, 5000, 10000];
  const handlePay = () => {
    setPaying(true);
    setTimeout(() => { setPaying(false); alert(`Mock: opening ${apps.find(a => a.id === app).name} for ₹${amount || 0}`); }, 1200);
  };
  return (
    <>
      <Header title="UPI" eyebrow="Pay from your bank" onBack={onBack} />
      <div style={{ padding: '0 22px 24px' }}>
        <div style={{ marginBottom: 26 }}>
          <div style={{ fontSize: 10, color: C.inkMute, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 10, fontWeight: 600 }}>
            Amount
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', borderBottom: `1px solid ${C.ink}`, paddingBottom: 12 }}>
            <span style={{ ...serif, fontSize: 56, color: C.inkMute, marginRight: 8, lineHeight: 1 }}>₹</span>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
              placeholder="0"
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                color: C.ink, ...serif, fontSize: 56, padding: 0, lineHeight: 1, letterSpacing: '-0.03em',
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            {presets.map(p => (
              <button key={p} type="button" onClick={() => setAmount(String(p))} style={{
                flex: 1, padding: '8px',
                background: 'transparent', border: `1px solid ${C.border}`,
                borderRadius: 999, color: C.inkDim, fontSize: 11, ...mono,
                cursor: 'pointer',
              }}>+₹{p}</button>
            ))}
          </div>
        </div>

        <div style={{ fontSize: 10, color: C.inkMute, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 10, fontWeight: 600 }}>
          UPI app
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 26 }}>
          {apps.map(a => (
            <button key={a.id} type="button" onClick={() => setApp(a.id)} style={{
              padding: '14px 16px', textAlign: 'left',
              background: app === a.id ? C.ink : C.bg,
              border: `1px solid ${app === a.id ? C.ink : C.border}`,
              borderRadius: 12, color: app === a.id ? C.bg : C.ink,
              fontSize: 13, fontWeight: 500,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              cursor: 'pointer',
            }}>
              {a.name}
              {app === a.id && <Check size={14} />}
            </button>
          ))}
        </div>

        <div style={{ marginBottom: 22 }}>
          <Row label="You pay" val={fmtINR(+amount || 0)} />
          <Row label="Platform fee" val="FREE" valColor={C.gain} />
          <Row label="You receive" val={fmtINR(+amount || 0)} bold />
        </div>

        <button type="button" onClick={handlePay} disabled={!amount || paying} style={{
          width: '100%', padding: '16px',
          background: !amount ? C.card : C.ink,
          color: !amount ? C.inkMute : C.bg,
          borderRadius: 14, fontSize: 14, fontWeight: 600,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          cursor: amount ? 'pointer' : 'not-allowed', border: 'none',
        }}>
          {paying ? 'Opening UPI app…' : <>Pay {fmtINR(+amount || 0)} <ChevronRight size={16} /></>}
        </button>
      </div>
    </>
  );
};

const DepositCryptoScreen = ({ onBack }) => {
  const [coin, setCoin] = useState('USDC');
  const [network, setNetwork] = useState('Polygon');
  const [copied, setCopied] = useState(false);
  const coins = ['USDC', 'USDT', 'BTC', 'ETH'];
  const networks = {
    USDC: ['Ethereum', 'Polygon', 'Solana', 'Base'],
    USDT: ['Ethereum', 'Tron', 'Polygon'],
    BTC: ['Bitcoin', 'Lightning'],
    ETH: ['Ethereum', 'Arbitrum', 'Optimism'],
  };
  const address = '0x' + (coin + network + '7fA92BE13F').padEnd(40, '4').slice(0, 40);
  const copy = () => {
    navigator.clipboard?.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <>
      <Header title="Crypto" eyebrow="Deposit on-chain" onBack={onBack} />
      <div style={{ padding: '0 22px 24px' }}>
        <div style={{ fontSize: 10, color: C.inkMute, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 10, fontWeight: 600 }}>Asset</div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 22 }}>
          {coins.map(c => (
            <button key={c} type="button" onClick={() => { setCoin(c); setNetwork(networks[c][0]); }} style={{
              flex: 1, padding: '12px',
              background: coin === c ? C.ink : C.bg,
              border: `1px solid ${coin === c ? C.ink : C.border}`,
              borderRadius: 10, color: coin === c ? C.bg : C.ink,
              fontSize: 13, fontWeight: 600, ...mono, cursor: 'pointer',
            }}>{c}</button>
          ))}
        </div>

        <div style={{ fontSize: 10, color: C.inkMute, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 10, fontWeight: 600 }}>Network</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 24 }}>
          {networks[coin].map(n => (
            <Pill key={n} active={network === n} onClick={() => setNetwork(n)}>{n}</Pill>
          ))}
        </div>

        <div style={{
          padding: 22, background: C.card, border: `1px solid ${C.border}`,
          borderRadius: 18, textAlign: 'center', marginBottom: 14,
        }}>
          <div style={{ fontSize: 11, color: C.inkDim, marginBottom: 14 }}>
            Send <span style={{ ...mono, color: C.ink, fontWeight: 600 }}>{coin}</span> on <span style={{ ...mono, color: C.ink, fontWeight: 600 }}>{network}</span> to:
          </div>
          <div style={{
            width: 156, height: 156, margin: '0 auto 18px',
            background: C.ink, borderRadius: 14, padding: 12,
          }}>
            <div style={{
              width: '100%', height: '100%',
              backgroundImage: `repeating-linear-gradient(0deg, ${C.bg} 0 4px, transparent 4px 8px),
                                repeating-linear-gradient(90deg, ${C.bg} 0 4px, transparent 4px 8px)`,
              opacity: 0.92,
            }} />
          </div>
          <div style={{
            ...mono, fontSize: 11, color: C.ink, padding: '12px 14px',
            background: C.bg, borderRadius: 10, wordBreak: 'break-all',
            border: `1px solid ${C.border}`, marginBottom: 12, lineHeight: 1.55,
          }}>
            {address}
          </div>
          <button type="button" onClick={copy} style={{
            padding: '10px 20px',
            background: copied ? C.gainSoft : C.ink,
            color: copied ? C.gain : C.bg,
            border: copied ? `1px solid ${C.gain}` : 'none',
            borderRadius: 999, fontSize: 12, fontWeight: 600,
            display: 'inline-flex', alignItems: 'center', gap: 6,
            cursor: 'pointer',
          }}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy address'}
          </button>
        </div>

        <div style={{
          padding: 14, background: C.lossSoft, border: `1px solid ${C.loss}30`,
          borderRadius: 12, display: 'flex', gap: 10,
        }}>
          <AlertCircle size={16} color={C.loss} style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ fontSize: 12, color: C.inkDim, lineHeight: 1.55 }}>
            Send <strong style={{ color: C.ink }}>only {coin} on {network}</strong>. Other assets or networks will be lost. Min: 1 {coin}.
          </div>
        </div>
      </div>
    </>
  );
};

const DepositCardScreen = ({ onBack }) => {
  const inputStyle = {
    width: '100%', background: 'transparent',
    border: 'none', borderBottom: `1px solid ${C.border}`,
    borderRadius: 0, padding: '12px 0',
    color: C.ink, fontSize: 14, outline: 'none',
    ...sans, transition: 'border-color .2s',
  };
  const [amount, setAmount] = useState('');
  const [card, setCard] = useState('');
  const [exp, setExp] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');
  const [paying, setPaying] = useState(false);
  const formatCard = v => v.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');
  const formatExp = v => {
    const c = v.replace(/\D/g, '').slice(0, 4);
    return c.length > 2 ? c.slice(0, 2) + '/' + c.slice(2) : c;
  };
  const valid = amount && card.replace(/\s/g, '').length === 16 && exp.length === 5 && cvv.length === 3 && name;
  const pay = () => {
    setPaying(true);
    setTimeout(() => { setPaying(false); alert(`Mock: charging $${amount} to card ending ${card.slice(-4)}`); }, 1500);
  };

  return (
    <>
      <Header title="Card" eyebrow="Visa or Mastercard" onBack={onBack} />
      <div style={{ padding: '0 22px 24px' }}>
        <div style={{
          padding: 22, borderRadius: 20,
          background: C.ink, color: C.bg,
          border: `1px solid ${C.borderHi}`,
          marginBottom: 22, position: 'relative', overflow: 'hidden', minHeight: 184,
        }}>
          <div style={{
            position: 'absolute', top: -40, right: -40, width: 180, height: 180,
            background: `radial-gradient(circle, rgba(255, 255, 255, 0.06), transparent 70%)`,
          }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 36, position: 'relative' }}>
            <span style={{ ...serif, fontSize: 18, color: C.bg, fontWeight: 400 }}>Stoxen</span>
            <span style={{ ...serif, fontSize: 18, color: C.bg, fontStyle: 'italic', opacity: 0.7 }}>VISA</span>
          </div>
          <div style={{ ...mono, fontSize: 18, color: C.bg, letterSpacing: '0.12em', marginBottom: 18, position: 'relative' }}>
            {(card || '•••• •••• •••• ••••').padEnd(19, '•').slice(0, 19)}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: C.inkMute, position: 'relative' }}>
            <div>
              <div style={{ fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Cardholder</div>
              <div style={{ ...mono, color: C.bg, marginTop: 3 }}>{name.toUpperCase() || 'YOUR NAME'}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Expires</div>
              <div style={{ ...mono, color: C.bg, marginTop: 3 }}>{exp || 'MM/YY'}</div>
            </div>
          </div>
        </div>

        <Field label="Amount (USD)">
          <div style={{ display: 'flex', alignItems: 'baseline', borderBottom: `1px solid ${C.ink}`, paddingBottom: 6 }}>
            <span style={{ ...serif, fontSize: 28, color: C.inkMute, marginRight: 6 }}>$</span>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
              placeholder="0" style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                color: C.ink, ...serif, fontSize: 28, padding: 0, letterSpacing: '-0.02em',
              }} />
          </div>
        </Field>

        <Field label="Card number">
          <input value={card} onChange={e => setCard(formatCard(e.target.value))}
            placeholder="1234 5678 9012 3456" style={inputStyle} inputMode="numeric" />
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Field label="Expiry">
            <input value={exp} onChange={e => setExp(formatExp(e.target.value))}
              placeholder="MM/YY" style={inputStyle} inputMode="numeric" />
          </Field>
          <Field label="CVV">
            <input type="password" value={cvv}
              onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
              placeholder="•••" style={inputStyle} inputMode="numeric" />
          </Field>
        </div>

        <Field label="Cardholder name">
          <input value={name} onChange={e => setName(e.target.value)}
            placeholder="Full name" style={inputStyle} />
        </Field>

        <div style={{ marginTop: 14, marginBottom: 18 }}>
          <Row label="Amount" val={fmtUSD(+amount || 0)} />
          <Row label="Processing fee 1.5%" val={fmtUSD(((+amount || 0) * 0.015))} />
          <Row label="Total charged" val={fmtUSD(((+amount || 0) * 1.015))} bold />
        </div>

        <button type="button" onClick={pay} disabled={!valid || paying} style={{
          width: '100%', padding: '16px',
          background: !valid ? C.card : C.ink,
          color: !valid ? C.inkMute : C.bg,
          borderRadius: 14, fontSize: 14, fontWeight: 600,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          cursor: valid ? 'pointer' : 'not-allowed', border: 'none',
        }}>
          <Lock size={14} />
          {paying ? 'Processing…' : `Pay ${fmtUSD(((+amount || 0) * 1.015))}`}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', marginTop: 14 }}>
          <Shield size={11} color={C.inkMute} />
          <span style={{ fontSize: 10, color: C.inkMute, letterSpacing: '0.06em' }}>
            256-bit SSL · PCI-DSS · 3D Secure
          </span>
        </div>
      </div>
    </>
  );
};

/* ════════════════════════════════════════════════════════════════════
   PROFILE
   ════════════════════════════════════════════════════════════════════ */
const ProfileScreen = ({ onBack, user, onLogout }) => {
  const displayName = user?.name || 'Guest';
  const displayEmail = user?.email || '';
  const initials = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const items = [
    { icon: <User size={15} />, label: 'Account details', sub: 'Personal information' },
    { icon: <Shield size={15} />, label: 'Security', sub: 'Password · 2FA · biometric' },
    { icon: <CreditCard size={15} />, label: 'Linked methods', sub: '2 cards · 1 UPI ID' },
    { icon: <Globe size={15} />, label: 'KYC verification', sub: 'Verified · Tier 2', verified: true },
  ];
  return (
    <>
      <Header title="Profile" eyebrow="Account" onBack={onBack} />
      <div style={{ padding: '0 22px 24px' }}>
        <div style={{
          padding: '24px 22px', background: C.card, border: `1px solid ${C.border}`,
          borderRadius: 20, marginBottom: 24,
          display: 'flex', alignItems: 'center', gap: 16,
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: C.ink,
            ...serif, fontSize: 26, color: C.bg,
            display: 'grid', placeItems: 'center', flexShrink: 0, fontWeight: 500,
          }}>{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ ...serif, fontSize: 22, color: C.ink, fontWeight: 400 }}>{displayName}</div>
            <div style={{ fontSize: 12, color: C.inkMute, marginTop: 2 }}>{displayEmail}</div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              marginTop: 8, padding: '3px 8px',
              background: C.gainSoft, color: C.gain,
              borderRadius: 6, fontSize: 10, fontWeight: 600, ...mono, letterSpacing: '0.04em',
            }}>
              <Sparkles size={10} /> KYC · TIER 2
            </div>
          </div>
        </div>

        {items.map((it, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', padding: '16px 0',
            borderBottom: i < items.length - 1 ? `1px solid ${C.border}` : 'none',
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: C.card, color: C.ink,
              border: `1px solid ${C.border}`,
              display: 'grid', placeItems: 'center', marginRight: 14,
            }}>{it.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: C.ink, fontWeight: 500 }}>{it.label}</div>
              <div style={{ fontSize: 11, color: C.inkMute, marginTop: 3 }}>{it.sub}</div>
            </div>
            {it.verified && <Check size={14} color={C.gain} style={{ marginRight: 6 }} />}
            <ChevronRight size={14} color={C.inkMute} />
          </div>
        ))}

        <button type="button" onClick={onLogout} style={{
          width: '100%', marginTop: 22, padding: 14, background: 'transparent',
          border: `1px solid ${C.border}`, borderRadius: 12,
          color: C.loss, fontSize: 13, fontWeight: 500,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          cursor: 'pointer',
        }}>
          <LogOut size={14} /> Sign out
        </button>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <div style={{ ...serif, fontSize: 24, color: C.inkMute, fontStyle: 'italic', marginBottom: 4, fontWeight: 400 }}>
            Stoxen
          </div>
          <div style={{ fontSize: 9, color: C.inkMute, letterSpacing: '0.18em', textTransform: 'uppercase', ...mono, fontWeight: 600 }}>
            v1.0 · tokenized equities
          </div>
        </div>
      </div>
    </>
  );
};


/* ════════════════════════════════════════════════════════════════════
   UNISWAP SWAP DEX
   ════════════════════════════════════════════════════════════════════ */
const UniswapSwap = ({ stock, side, onClose, web3Wallet, fetchPortfolio }) => {
  const [inputAsset, setInputAsset] = useState('USDC');
  const [inputAmount, setInputAmount] = useState('');
  const [slippage, setSlippage] = useState(0.5);
  const [customSlippage, setCustomSlippage] = useState('');
  const [slippageOpen, setSlippageOpen] = useState(false);

  const [step, setStep] = useState('idle'); // idle, approving, signing, broadcasting, success, failed
  const [txHash, setTxHash] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const [faucetLoading, setFaucetLoading] = useState(false);
  const [metamaskLoading, setMetamaskLoading] = useState(false);

  // Conversion logic parameters
  const ETH_PRICE_USD = 3200;
  const inputPriceUSD = inputAsset === 'ETH' ? ETH_PRICE_USD : 1;
  const stockPriceUSD = stock.currency === 'INR' ? stock.price / USD_INR : stock.price;

  // Rate: stock tokens per 1 input asset
  const rateInputToOutput = inputPriceUSD / stockPriceUSD;
  const outputAmount = parseFloat(inputAmount) ? parseFloat(inputAmount) * rateInputToOutput : 0;

  // Simulated swap calculations
  const priceImpact = parseFloat(inputAmount) ? Math.min((parseFloat(inputAmount) / 30000) * 100, 15).toFixed(2) : '0.00';
  const lpFee = '0.05%';
  const networkGas = inputAsset === 'ETH' ? '0.0012 ETH (~$3.84)' : '1.50 USDC';

  const walletAddress = web3Wallet?.address || '';
  const walletConnected = !!walletAddress;

  const currentBalance = inputAsset === 'ETH' ? web3Wallet?.balances?.ETH || 0 : web3Wallet?.balances?.USDC || 0;
  const outputBalance = web3Wallet?.holdings?.find(h => h.symbol === stock.sym)?.qty || 0;

  const isMetaMaskAvailable = typeof window !== 'undefined' && !!window.ethereum;

  const connectWallet = async (useMetaMask = false) => {
    if (useMetaMask && isMetaMaskAvailable) {
      setMetamaskLoading(true);
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
          const addr = accounts[0];
          await axios.post('/api/user/wallet', { address: addr });
          await fetchPortfolio();
        }
      } catch (err) {
        console.error('MetaMask connection failed:', err);
      } finally {
        setMetamaskLoading(false);
      }
    } else {
      // Generate standard mock wallet
      const mockAddr = '0x71C' + Array.from({ length: 37 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      await axios.post('/api/user/wallet', { address: mockAddr });
      await fetchPortfolio();
    }
  };

  const copyAddress = () => {
    if (!walletAddress) return;
    navigator.clipboard?.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleFaucet = async () => {
    setFaucetLoading(true);
    try {
      const amount = inputAsset === 'ETH' ? 1.0 : 1000.0;
      await axios.post('/api/user/faucet', { asset: inputAsset, amount });
      await fetchPortfolio();
    } catch (err) {
      console.error('Faucet request failed:', err);
    } finally {
      setFaucetLoading(false);
    }
  };

  const handleSwap = async () => {
    if (!inputAmount || parseFloat(inputAmount) <= 0) return;
    setErrorMsg('');

    if (parseFloat(inputAmount) > currentBalance) {
      setErrorMsg(`Insufficient ${inputAsset} balance in Web3 wallet`);
      return;
    }

    try {
      // Step 1: Token Approval (simulated for ERC-20 stablecoins)
      if (inputAsset !== 'ETH') {
        setStep('approving');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Step 2: Request Wallet Signature
      setStep('signing');
      const finalTxHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

      // If MetaMask is connected, trigger a real message signature for maximum authenticity!
      if (isMetaMaskAvailable) {
        try {
          const currentAccounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (currentAccounts.length > 0 && walletAddress.toLowerCase() === currentAccounts[0].toLowerCase()) {
            const message = `Confirm Stockwave Swap:\n\nSwapping: ${inputAmount} ${inputAsset}\nReceiving: ${outputAmount.toFixed(4)} ${stock.sym}\nUniswap Pool Fee: 0.05%\nTx Hash: ${finalTxHash}`;
            await window.ethereum.request({
              method: 'personal_sign',
              params: [message, walletAddress]
            });
          } else {
            await new Promise(resolve => setTimeout(resolve, 1500));
          }
        } catch (err) {
          setErrorMsg('Transaction signature rejected by wallet.');
          setStep('idle');
          return;
        }
      } else {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      // Step 3: Broadcast transaction
      setStep('broadcasting');
      setTxHash(finalTxHash);

      await axios.post('/api/trades/swap', {
        inputToken: inputAsset,
        outputToken: stock.sym,
        inputAmount: parseFloat(inputAmount),
        outputAmount: outputAmount,
        txHash: finalTxHash
      });

      await fetchPortfolio();
      setStep('success');
    } catch (err) {
      console.error('Swap execution failed:', err);
      setErrorMsg(err.response?.data?.error || 'Blockchain transaction failed.');
      setStep('failed');
    }
  };

  const handleSlippageSelect = (val) => {
    setSlippage(val);
    setCustomSlippage('');
  };

  // Render Overlay states for active transactions
  if (step !== 'idle' && step !== 'failed') {
    return (
      <div style={{ padding: '20px 0', textAlign: 'center', minHeight: 280, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        {step === 'approving' && (
          <>
            <div style={{ width: 54, height: 54, borderRadius: '50%', border: '3px solid rgba(255, 0, 128, 0.1)', borderTopColor: '#ff0080', animation: 'spin 1s linear infinite', marginBottom: 20 }} />
            <div style={{ ...serif, fontSize: 20, color: C.ink, fontWeight: 500, marginBottom: 8 }}>Approving Uniswap Router</div>
            <div style={{ fontSize: 13, color: C.inkMute, padding: '0 20px', lineHeight: 1.5 }}>Granting permissions to Uniswap V3 Smart Contracts to spend your mock {inputAsset}.</div>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </>
        )}

        {step === 'signing' && (
          <>
            <div style={{ width: 54, height: 54, borderRadius: '50%', border: '3px solid rgba(255, 0, 128, 0.1)', borderTopColor: '#ff0080', animation: 'spin 1.5s ease-in-out infinite', marginBottom: 20, display: 'grid', placeItems: 'center' }}>
              <Lock size={20} color="#ff0080" />
            </div>
            <div style={{ ...serif, fontSize: 20, color: C.ink, fontWeight: 500, marginBottom: 8 }}>Awaiting Signature</div>
            <div style={{ fontSize: 13, color: C.inkMute, padding: '0 20px', lineHeight: 1.5 }}>Please sign the message request in your Web3 wallet to authorize the tokenized stock swap.</div>
          </>
        )}

        {step === 'broadcasting' && (
          <>
            <div style={{ width: 54, height: 54, borderRadius: '50%', border: '3px solid rgba(255, 0, 128, 0.1)', borderTopColor: '#ff0080', animation: 'spin 0.8s linear infinite', marginBottom: 20 }} />
            <div style={{ ...serif, fontSize: 20, color: C.ink, fontWeight: 500, marginBottom: 8 }}>Broadcasting Transaction</div>
            <div style={{ fontSize: 12, color: C.inkMute, fontFamily: 'monospace', marginBottom: 12 }}>{txHash.slice(0, 10)}...{txHash.slice(-8)}</div>
            <div style={{ fontSize: 13, color: C.inkMute, padding: '0 20px', lineHeight: 1.5 }}>Sending swap execution to blockchain nodes. Waiting for inclusion block confirmation...</div>
          </>
        )}

        {step === 'success' && (
          <>
            <div style={{ width: 54, height: 54, borderRadius: '50%', background: C.gainSoft, border: `2px solid ${C.gain}`, display: 'grid', placeItems: 'center', color: C.gain, marginBottom: 20, animation: 'scaleUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
              <Check size={26} strokeWidth={3} />
            </div>
            <div style={{ ...serif, fontSize: 22, color: C.ink, fontWeight: 500, marginBottom: 8 }}>Swap Successful!</div>
            <div style={{ fontSize: 13, color: C.inkDim, padding: '0 10px', marginBottom: 18, lineHeight: 1.55 }}>
              Successfully swapped <strong>{inputAmount} {inputAsset}</strong> for <strong>{outputAmount.toFixed(4)} {stock.sym}</strong>.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', padding: '0 10px' }}>
              <a href={`https://etherscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '14px', borderRadius: 12, border: `1px solid ${C.border}`,
                color: C.inkDim, fontSize: 13, fontWeight: 600, textDecoration: 'none',
                background: C.bg2,
              }}>
                <Globe size={14} /> View on Etherscan
              </a>
              <button type="button" onClick={onClose} style={{
                padding: '14px', borderRadius: 12, background: C.ink, color: C.bg,
                fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
              }}>
                Back to dashboard
              </button>
            </div>
            <style>{`@keyframes scaleUp { from { transform: scale(0.6); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
          </>
        )}
      </div>
    );
  }

  return (
    <div style={{ animation: 'slideUp 0.3s ease-out' }}>
      {/* Wallet Connection header */}
      <div style={{
        padding: '14px 16px', background: 'rgba(255, 0, 128, 0.03)',
        border: '1px solid rgba(255, 0, 128, 0.08)', borderRadius: 18,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 20,
      }}>
        {walletConnected ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: C.gain, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: C.ink, fontWeight: 600, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', ...mono }}>
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </span>
            <button type="button" onClick={copyAddress} style={{
              background: 'transparent', border: 'none', cursor: 'pointer', padding: 2, display: 'grid', placeItems: 'center', color: C.inkMute
            }}>
              {copied ? <Check size={12} color={C.gain} /> : <Copy size={12} />}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ fontSize: 11, color: C.inkMute }}>No Web3 Wallet Connected</div>
          </div>
        )}

        {walletConnected ? (
          <button type="button" onClick={handleFaucet} disabled={faucetLoading} style={{
            padding: '6px 12px', background: 'transparent', border: '1px solid rgba(255, 0, 128, 0.25)',
            borderRadius: 8, color: '#ff0080', fontSize: 10, fontWeight: 700,
            cursor: faucetLoading ? 'not-allowed' : 'pointer', transition: 'all 0.15s',
            ...mono,
          }}>
            {faucetLoading ? 'Minting…' : `Faucet: +${inputAsset === 'ETH' ? '1 ETH' : '1k USDC'}`}
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 6 }}>
            {isMetaMaskAvailable && (
              <button type="button" onClick={() => connectWallet(true)} disabled={metamaskLoading} style={{
                padding: '8px 12px', background: '#ff0080', color: C.bg, border: 'none',
                borderRadius: 10, fontSize: 11, fontWeight: 700, cursor: 'pointer',
              }}>
                {metamaskLoading ? 'MetaMask…' : 'MetaMask'}
              </button>
            )}
            <button type="button" onClick={() => connectWallet(false)} style={{
              padding: '8px 12px', background: 'transparent', border: `1px solid ${C.borderHi}`,
              color: C.ink, borderRadius: 10, fontSize: 11, fontWeight: 600, cursor: 'pointer',
            }}>
              Mock Wallet
            </button>
          </div>
        )}
      </div>

      {/* SWAP FIELDS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, position: 'relative', marginBottom: 16 }}>
        {/* Input Field: You Pay */}
        <div style={{
          background: C.card, border: `1px solid ${C.border}`,
          borderRadius: 16, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 6,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: C.inkMute, fontWeight: 600 }}>You pay</span>
            <span style={{ fontSize: 11, color: C.inkMute, ...mono }}>
              Balance: {walletConnected ? currentBalance.toFixed(2) : '--'}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <input type="number" value={inputAmount} onChange={e => setInputAmount(e.target.value)}
              placeholder="0" style={{
                flex: 1, minWidth: 0, background: 'transparent', border: 'none', outline: 'none',
                color: C.ink, ...serif, fontSize: 32, padding: 0, letterSpacing: '-0.02em',
              }}
            />
            <select value={inputAsset} onChange={e => { setInputAsset(e.target.value); setInputAmount(''); }} style={{
              background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10,
              padding: '6px 10px', color: C.ink, fontSize: 12, fontWeight: 700, outline: 'none', ...mono,
            }}>
              <option value="USDC">USDC</option>
              <option value="ETH">ETH</option>
            </select>
          </div>
        </div>

        {/* Swap Down Arrow Icon */}
        <div style={{
          position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
          width: 32, height: 32, borderRadius: '50%', background: C.bg, border: `1px solid ${C.border}`,
          display: 'grid', placeItems: 'center', zIndex: 5, color: '#ff0080', cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}>
          ↓
        </div>

        {/* Output Field: You Receive */}
        <div style={{
          background: C.card, border: `1px solid ${C.border}`,
          borderRadius: 16, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 6,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: C.inkMute, fontWeight: 600 }}>You receive</span>
            <span style={{ fontSize: 11, color: C.inkMute, ...mono }}>
              Balance: {walletConnected ? outputBalance.toFixed(4) : '--'}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ ...serif, fontSize: 32, color: outputAmount ? C.ink : C.inkMute }}>
              {outputAmount ? outputAmount.toFixed(4) : '0'}
            </span>
            <div style={{
              background: 'rgba(255, 0, 128, 0.08)', border: '1px solid rgba(255, 0, 128, 0.15)',
              borderRadius: 12, padding: '6px 14px', color: '#ff0080', fontSize: 12, fontWeight: 700, ...mono,
            }}>
              {stock.sym}
            </div>
          </div>
        </div>
      </div>

      {/* Slippage & Details Section */}
      <div style={{ padding: '0 8px', marginBottom: 20 }}>
        {/* Slippage settings trigger */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 11, color: C.inkMute }}>Slippage Tolerance</span>
          <div style={{ position: 'relative' }}>
            <button type="button" onClick={() => setSlippageOpen(!slippageOpen)} style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: '#ff0080', fontSize: 11, fontWeight: 700, ...mono,
            }}>
              {slippage}% ⚙️
            </button>

            {slippageOpen && (
              <div style={{
                position: 'absolute', right: 0, bottom: 20, zIndex: 10,
                background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12,
                padding: 12, display: 'flex', flexDirection: 'column', gap: 8,
                boxShadow: '0 8px 24px rgba(0,0,0,0.08)', minWidth: 160,
              }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: C.inkMute }}>Slippage settings</div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[0.1, 0.5, 1.0].map(s => (
                    <button key={s} type="button" onClick={() => handleSlippageSelect(s)} style={{
                      flex: 1, padding: '4px', border: `1px solid ${slippage === s ? '#ff0080' : C.border}`,
                      background: slippage === s ? 'rgba(255, 0, 128, 0.05)' : 'transparent',
                      color: slippage === s ? '#ff0080' : C.inkDim, borderRadius: 6, fontSize: 10, fontWeight: 600, ...mono,
                    }}>{s}%</button>
                  ))}
                </div>
                <input type="number" placeholder="Custom" value={customSlippage} onChange={e => {
                  setCustomSlippage(e.target.value);
                  if (parseFloat(e.target.value)) setSlippage(parseFloat(e.target.value));
                }} style={{
                  width: '100%', padding: '6px 8px', background: C.card, border: `1px solid ${C.border}`,
                  borderRadius: 6, fontSize: 10, outline: 'none', color: C.ink, ...mono,
                }} />
                <button type="button" onClick={() => setSlippageOpen(false)} style={{
                  padding: '6px', background: C.ink, color: C.bg, border: 'none',
                  borderRadius: 6, fontSize: 10, fontWeight: 600, cursor: 'pointer',
                }}>Save</button>
              </div>
            )}
          </div>
        </div>

        {/* Uniswap Route visualizer */}
        <div style={{
          padding: '12px 14px', background: C.bg2, border: `1px solid ${C.border}`,
          borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 11,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: C.inkMute }}>
            <span>Route</span>
            <span style={{ color: C.inkDim, fontWeight: 600, ...mono, display: 'flex', alignItems: 'center', gap: 4 }}>
              {inputAsset} ➔ {inputAsset === 'ETH' ? '' : 'WETH ➔ '} {stock.sym}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', color: C.inkMute }}>
            <span>Price Impact</span>
            <span style={{ color: parseFloat(priceImpact) > 2 ? C.ember : C.gain, fontWeight: 600, ...mono }}>
              {priceImpact}%
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', color: C.inkMute }}>
            <span>Liquidity Provider Fee</span>
            <span style={{ color: C.inkDim, fontWeight: 600, ...mono }}>{lpFee}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', color: C.inkMute }}>
            <span>Estimated Network Cost</span>
            <span style={{ color: C.inkDim, fontWeight: 600, ...mono }}>{networkGas}</span>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div style={{
          padding: '10px 14px', background: C.lossSoft, border: `1px solid ${C.loss}20`,
          borderRadius: 10, color: C.loss, fontSize: 12, fontWeight: 500,
          display: 'flex', gap: 8, alignItems: 'center', marginBottom: 14,
        }}>
          <AlertCircle size={14} style={{ flexShrink: 0 }} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* SWAP ACTION BUTTON */}
      <button type="button" onClick={handleSwap} disabled={!walletConnected || !inputAmount || parseFloat(inputAmount) <= 0} style={{
        width: '100%', padding: '16px',
        background: !walletConnected ? C.card : (!inputAmount || parseFloat(inputAmount) <= 0 ? 'rgba(255, 0, 128, 0.4)' : '#ff0080'),
        color: !walletConnected ? C.inkMute : C.bg,
        borderRadius: 14, fontSize: 14, fontWeight: 600,
        cursor: walletConnected && inputAmount && parseFloat(inputAmount) > 0 ? 'pointer' : 'not-allowed',
        border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        transition: 'all 0.2s',
      }}>
        {!walletConnected ? (
          'Connect Wallet to Swap'
        ) : !inputAmount ? (
          'Enter an amount'
        ) : (
          <>
            <Sparkles size={14} /> Swap DEX
          </>
        )}
      </button>
    </div>
  );
};
/* ════════════════════════════════════════════════════════════════════
   TRADE MODAL
   ════════════════════════════════════════════════════════════════════ */
const TradeModal = ({ stock, side, onClose, web3Wallet, fetchPortfolio }) => {
  const [tradeMode, setTradeMode] = useState('brokerage'); // 'brokerage' or 'uniswap'
  const [amount, setAmount] = useState('');
  const [unit, setUnit] = useState(() => stock?.currency || 'USD');
  const [orderType, setOrderType] = useState('market');
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const ccyLabel = stock.currency || 'USD';
  const tokens = unit === ccyLabel ? (+amount / stock.price) : +amount;
  const total = unit === ccyLabel ? +amount : (+amount * stock.price);
  const handleSubmit = async () => {
    if (!amount || +amount <= 0) return;
    setSubmitting(true);
    setStatusMsg('');
    try {
      const token = localStorage.getItem('sw_token');
      const endpoint = side === 'buy' ? '/api/trades/buy' : '/api/trades/sell';
      await axios.post(endpoint, { symbol: stock.sym, qty: tokens, price: stock.price }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setStatusMsg(`${side === 'buy' ? 'Bought' : 'Sold'} ${tokens.toFixed(4)} ${stock.sym}`);
      await fetchPortfolio();
      setTimeout(onClose, 1200);
    } catch {
      setStatusMsg('Order failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.45)',
      backdropFilter: 'blur(8px)', zIndex: 200,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: 420,
        background: C.bg, border: `1px solid ${C.border}`,
        borderRadius: '24px 24px 0 0', padding: 24,
        animation: 'slideUp .35s cubic-bezier(.2,.9,.3,1)',
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        <div style={{ width: 36, height: 4, background: C.border, borderRadius: 999, margin: '0 auto 22px' }} />

        {/* Segmented Mode Selector */}
        <div style={{
          display: 'flex', background: C.card, borderRadius: 12, padding: 4, marginBottom: 20,
          border: `1px solid ${C.border}`
        }}>
          <button type="button" onClick={() => setTradeMode('brokerage')} style={{
            flex: 1, padding: '10px 0', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600,
            background: tradeMode === 'brokerage' ? C.bg : 'transparent',
            color: tradeMode === 'brokerage' ? C.ink : C.inkMute,
            cursor: 'pointer', transition: 'all 0.15s'
          }}>
            Stoxen Brokerage
          </button>
          <button type="button" onClick={() => setTradeMode('uniswap')} style={{
            flex: 1, padding: '10px 0', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600,
            background: tradeMode === 'uniswap' ? 'rgba(255, 0, 128, 0.06)' : 'transparent',
            color: tradeMode === 'uniswap' ? '#ff0080' : C.inkMute,
            cursor: 'pointer', transition: 'all 0.15s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4
          }}>
            <Sparkles size={12} /> Uniswap DEX
          </button>
        </div>

        {tradeMode === 'uniswap' ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
              <div>
                <div style={{ fontSize: 10, color: '#ff0080', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 4, fontWeight: 600 }}>
                  Uniswap DEX Swap
                </div>
                <div style={{ ...serif, fontSize: 28, color: C.ink, lineHeight: 1, fontWeight: 400, marginTop: 6 }}>{stock.sym}</div>
                <div style={{ ...mono, fontSize: 11, color: C.inkDim, marginTop: 4 }}>
                  @ {fmtPrice(stock.price, stock.currency)} · {stock.name}
                </div>
              </div>
              <button type="button" onClick={onClose} style={{
                width: 32, height: 32, borderRadius: 999,
                background: C.card, color: C.ink,
                border: `1px solid ${C.border}`,
                display: 'grid', placeItems: 'center', cursor: 'pointer',
              }}><X size={15} /></button>
            </div>

            <UniswapSwap stock={stock} side={side} onClose={onClose} web3Wallet={web3Wallet} fetchPortfolio={fetchPortfolio} />
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
              <div>
                <div style={{ fontSize: 10, color: side === 'buy' ? C.gain : C.loss, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 4, fontWeight: 600 }}>
                  {side === 'buy' ? 'Buy' : 'Sell'} order
                </div>
                <div style={{ ...serif, fontSize: 28, color: C.ink, lineHeight: 1, fontWeight: 400, marginTop: 6 }}>{stock.sym}</div>
                <div style={{ ...mono, fontSize: 11, color: C.inkDim, marginTop: 4 }}>
                  @ {fmtPrice(stock.price, stock.currency)} · {stock.name}
                </div>
              </div>
              <button type="button" onClick={onClose} style={{
                width: 32, height: 32, borderRadius: 999,
                background: C.card, color: C.ink,
                border: `1px solid ${C.border}`,
                display: 'grid', placeItems: 'center', cursor: 'pointer',
              }}><X size={15} /></button>
            </div>

            <div style={{ display: 'flex', gap: 0, padding: 0, border: `1px solid ${C.ink}`, borderRadius: 999, marginBottom: 18, overflow: 'hidden' }}>
              {['market', 'limit'].map(t => (
                <button key={t} type="button" onClick={() => setOrderType(t)} style={{
                  flex: 1, padding: '10px',
                  background: orderType === t ? C.ink : 'transparent',
                  color: orderType === t ? C.bg : C.ink,
                  fontSize: 12, fontWeight: 600, textTransform: 'capitalize',
                  border: 'none', cursor: 'pointer',
                }}>{t}</button>
              ))}
            </div>

            <div style={{
              background: C.card, border: `1px solid ${C.border}`,
              borderRadius: 16, padding: 18, marginBottom: 14,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 10, color: C.inkMute, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600 }}>Amount</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[ccyLabel, 'TOKEN'].map(u => (
                    <button key={u} type="button" onClick={() => setUnit(u)} style={{
                      padding: '3px 9px', borderRadius: 6,
                      background: unit === u ? C.ink : 'transparent',
                      color: unit === u ? C.bg : C.inkMute,
                      fontSize: 10, fontWeight: 700, ...mono, letterSpacing: '0.04em',
                      border: 'none', cursor: 'pointer',
                    }}>{u}</button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline' }}>
                <span style={{ ...serif, fontSize: 36, color: C.inkMute, marginRight: 6 }}>
                  {unit === ccyLabel ? (ccyLabel === 'INR' ? '₹' : '$') : ''}
                </span>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                  placeholder="0"
                  style={{
                    flex: 1, background: 'transparent', border: 'none', outline: 'none',
                    color: C.ink, ...serif, fontSize: 40, padding: 0, letterSpacing: '-0.03em',
                  }}
                />
                <span style={{ ...mono, fontSize: 12, color: C.inkMute }}>
                  {unit === 'TOKEN' ? stock.sym : ''}
                </span>
              </div>
              <div style={{ ...mono, fontSize: 11, color: C.inkMute, marginTop: 8 }}>
                ≈ {unit === ccyLabel ? `${tokens.toFixed(4)} ${stock.sym}` : fmtPrice(total, ccyLabel)}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
              {['25%', '50%', '75%', 'MAX'].map(p => (
                <button key={p} type="button" style={{
                  flex: 1, padding: '9px',
                  background: 'transparent', border: `1px solid ${C.border}`,
                  borderRadius: 999, color: C.inkDim, fontSize: 11, fontWeight: 600, ...mono,
                  cursor: 'pointer',
                }}>{p}</button>
              ))}
            </div>

            {statusMsg && (
              <div style={{ textAlign: 'center', fontSize: 13, color: statusMsg.includes('failed') ? C.loss : C.gain, marginBottom: 10, fontWeight: 500 }}>
                {statusMsg}
              </div>
            )}
            <button type="button" onClick={handleSubmit} disabled={!amount || submitting} style={{
              width: '100%', padding: '16px',
              background: !amount ? C.card : (side === 'buy' ? C.gain : C.loss),
              color: !amount ? C.inkMute : C.bg,
              borderRadius: 14, fontSize: 14, fontWeight: 600,
              cursor: amount ? 'pointer' : 'not-allowed', border: 'none',
            }}>
              {submitting ? 'Confirming…' : `${side === 'buy' ? 'Buy' : 'Sell'} ${stock.sym}`}
            </button>
          </>
        )}
      </div>
    </div>
  );
};
/* ════════════════════════════════════════════════════════════════════
   TAB BAR — z-index 50, always above everything except modals
   ════════════════════════════════════════════════════════════════════ */
const TabBar = ({ tab, onTabClick }) => {
  const tabs = [
    { id: 'home', icon: HomeIcon, label: 'Home' },
    { id: 'markets', icon: TrendingUp, label: 'Markets' },
    { id: 'portfolio', icon: Briefcase, label: 'Portfolio' },
    { id: 'wallet', icon: WalletIcon, label: 'Wallet' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      background: C.bg,
      borderTop: `1px solid ${C.border}`,
      padding: '8px 8px 16px',
      display: 'flex', justifyContent: 'space-around',
      zIndex: 50,
    }}>
      {tabs.map(t => {
        const Icon = t.icon;
        const active = tab === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onTabClick(t.id)}
            style={{
              flex: 1, padding: '8px 4px', minHeight: 52,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 4,
              position: 'relative',
              color: active ? C.ink : C.inkMute,
              transition: 'color .15s',
              cursor: 'pointer',
              background: 'transparent', border: 'none',
              userSelect: 'none',
            }}>
            {active && (
              <span style={{
                position: 'absolute', top: -8, width: 24, height: 2,
                background: C.ink, borderRadius: 999,
                pointerEvents: 'none',
              }} />
            )}
            <Icon size={20} strokeWidth={active ? 2.2 : 1.7} style={{ pointerEvents: 'none' }} />
            <span style={{
              fontSize: 10, fontWeight: active ? 600 : 500, letterSpacing: '0.04em',
              pointerEvents: 'none',
            }}>
              {t.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════
   AUTH SCREENS
   ════════════════════════════════════════════════════════════════════ */
const AuthField = ({ label, type, value, onChange, placeholder }) => (
  <div style={{ marginBottom: 16 }}>
    <div style={{ fontSize: 10, color: C.inkMute, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>{label}</div>
    <input
      type={type} value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: '100%', padding: '14px 16px',
        background: C.card, border: `1px solid ${C.border}`,
        borderRadius: 12, outline: 'none', fontSize: 14, color: C.ink,
        fontFamily: 'inherit',
        boxSizing: 'border-box',
      }}
    />
  </div>
);

const LoginScreen = ({ onLogin, goRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.post('/api/auth/login', { email, password });
      onLogin(data.token, data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px 28px' }}>
      <div style={{ marginBottom: 40 }}>
        <div style={{ ...serif, fontSize: 42, color: C.ink, fontWeight: 400, lineHeight: 1, marginBottom: 8 }}>Welcome<br />back.</div>
        <div style={{ fontSize: 13, color: C.inkMute }}>Sign in to your Stoxen account</div>
      </div>
      <form onSubmit={handleLogin}>
        <AuthField label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
        <AuthField label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" />
        {error && <div style={{ color: C.loss, fontSize: 12, marginBottom: 12, textAlign: 'center' }}>{error}</div>}
        <button type="submit" disabled={loading || !email || !password} style={{
          width: '100%', padding: '16px', background: C.ink, color: C.bg,
          borderRadius: 14, fontSize: 14, fontWeight: 600, border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: 8,
        }}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <div style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: C.inkMute }}>
        No account?{' '}
        <button type="button" onClick={goRegister} style={{ color: C.ink, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>
          Create one
        </button>
      </div>
    </div>
  );
};

const RegisterScreen = ({ onLogin, goLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match'); return; }
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.post('/api/auth/register', { name, email, phone, password });
      onLogin(data.token, data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100%', overflowY: 'auto', padding: '40px 28px' }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ ...serif, fontSize: 42, color: C.ink, fontWeight: 400, lineHeight: 1, marginBottom: 8 }}>Create<br />account.</div>
        <div style={{ fontSize: 13, color: C.inkMute }}>Start trading tokenized equities</div>
      </div>
      <form onSubmit={handleRegister}>
        <AuthField label="Full name" type="text" value={name} onChange={setName} placeholder="Aarav Sharma" />
        <AuthField label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
        <AuthField label="Phone" type="tel" value={phone} onChange={setPhone} placeholder="+91 XXXXXXXXXX" />
        <AuthField label="Password" type="password" value={password} onChange={setPassword} placeholder="Min 6 characters" />
        <AuthField label="Confirm password" type="password" value={confirm} onChange={setConfirm} placeholder="Repeat password" />
        {error && <div style={{ color: C.loss, fontSize: 12, marginBottom: 12, textAlign: 'center' }}>{error}</div>}
        <button type="submit" disabled={loading || !name || !email || !password} style={{
          width: '100%', padding: '16px', background: C.ink, color: C.bg,
          borderRadius: 14, fontSize: 14, fontWeight: 600, border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: 8,
        }}>
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <div style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: C.inkMute }}>
        Already have an account?{' '}
        <button type="button" onClick={goLogin} style={{ color: C.ink, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>
          Sign in
        </button>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════
   APP — single source of truth, clean routing
   ════════════════════════════════════════════════════════════════════ */
export default function App() {
  const [screen, setScreen] = useState('home');
  const [stack, setStack] = useState([]);
  const [tab, setTab] = useState('home');
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [tradeSide, setTradeSide] = useState(null);
  const [balanceVisible, setBalanceVisible] = useState(true);

  // Auth state — persisted to localStorage
  const [token, setToken] = useState(() => localStorage.getItem('sw_token') || null);
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sw_user') || 'null'); } catch { return null; }
  });

  // Dynamic Portfolio states
  const [holdings, setHoldings] = useState([]);
  const [cashBalance, setCashBalance] = useState(50000);
  const [web3Wallet, setWeb3Wallet] = useState({
    address: '',
    balances: { ETH: 0, USDC: 0, USDT: 0 },
    holdings: []
  });
  const [transactions, setTransactions] = useState([]);

  // Set axios auth header on token change
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [token]);

  const fetchPortfolio = useCallback(async () => {
    if (!token) return;
    try {
      const { data } = await axios.get('/api/portfolio');
      const normalizedHoldings = (data.holdings || []).map(h => ({
        ...h,
        sym: h.sym || h.symbol,
        symbol: h.symbol || h.sym
      }));
      setHoldings(normalizedHoldings);
      setCashBalance(data.cash || 0);

      const normalizedWeb3 = data.web3 || { address: '', balances: { ETH: 0, USDC: 0, USDT: 0 }, holdings: [] };
      if (normalizedWeb3.holdings) {
        normalizedWeb3.holdings = normalizedWeb3.holdings.map(h => ({
          ...h,
          sym: h.sym || h.symbol,
          symbol: h.symbol || h.sym
        }));
      }
      setWeb3Wallet(normalizedWeb3);
      setTransactions(data.transactions || []);
    } catch (err) {
      console.error('Failed to fetch portfolio:', err);
    }
  }, [token]);

  useEffect(() => {
    fetchPortfolio();
  }, [token, fetchPortfolio]);

  // Live stock prices — updated by WebSocket
  const [stocks, setStocks] = useState(INITIAL_STOCKS);

  // Auth gate — show login/register if not authenticated
  const [authScreen, setAuthScreen] = useState('login');

  const handleLogin = useCallback((tok, usr) => {
    localStorage.setItem('sw_token', tok);
    localStorage.setItem('sw_user', JSON.stringify(usr));
    axios.defaults.headers.common['Authorization'] = `Bearer ${tok}`;
    setToken(tok);
    setUser(usr);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('sw_token');
    localStorage.removeItem('sw_user');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
    setScreen('home');
    setStack([]);
    setTab('home');
    setHoldings([]);
    setCashBalance(50000);
    setWeb3Wallet({ address: '', balances: { ETH: 0, USDC: 0, USDT: 0 }, holdings: [] });
    setTransactions([]);
  }, []);

  // WebSocket — live price updates
  useEffect(() => {
    const socket = io(getBackendUrl(), { path: '/socket.io', transports: ['websocket', 'polling'] });
    socket.on('prices_update', (priceMap) => {
      setStocks(prev => prev.map(s => {
        const u = priceMap[s.sym];
        if (!u) return s;
        return {
          ...s, price: u.price, change: u.change, changePercent: u.changePercent,
          ...(u.marketCap && { marketCap: u.marketCap }),
          ...(u.volume && { volume: u.volume }),
          ...(u.dayHigh && { dayHigh: u.dayHigh }),
          ...(u.dayLow && { dayLow: u.dayLow }),
        };
      }));
    });
    return () => socket.disconnect();
  }, []);

  // Fetch initial stocks from backend API on mount
  useEffect(() => {
    const fetchInitialStocks = async () => {
      try {
        const { data } = await axios.get('/api/stocks');
        if (Array.isArray(data)) {
          setStocks(prev => prev.map(s => {
            const u = data.find(x => x.symbol === s.sym);
            if (!u) return s;
            return {
              ...s, price: u.price, change: u.change, changePercent: u.changePercent,
              ...(u.marketCap && { marketCap: u.marketCap }),
              ...(u.volume && { volume: u.volume }),
              ...(u.dayHigh && { dayHigh: u.dayHigh }),
              ...(u.dayLow && { dayLow: u.dayLow }),
            };
          }));
        }
      } catch (err) {
        console.error('Failed to fetch initial stocks:', err);
      }
    };
    fetchInitialStocks();
  }, []);

  // Compute selected stock from live stocks array
  const selectedStock = selectedSymbol ? stocks.find(s => s.sym === selectedSymbol) || null : null;

  // Load fonts once
  useEffect(() => {
    const id = 'stoxen-fonts';
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;1,9..144,400&family=JetBrains+Mono:wght@400;500;600&display=swap';
    document.head.appendChild(link);
  }, []);

  // Navigation
  const go = (next) => {
    setStack(s => [...s, screen]);
    setScreen(next);
  };
  const back = () => {
    setStack(s => {
      const prev = s[s.length - 1] || tab;
      setScreen(prev);
      return s.slice(0, -1);
    });
  };
  const onTabClick = (t) => {
    setTab(t);
    setScreen(t);
    setStack([]);
    setTradeSide(null);
  };
  const openStock = (s) => {
    setSelectedSymbol(s.sym);
    go('detail');
  };

  // back is shown on tab screens only when there's a stack (came via go)
  const tabBackProp = stack.length > 0 ? back : null;

  // Render the current screen
  let content = null;
  switch (screen) {
    case 'home':
      content = <HomeScreen go={go} openTrade={openStock} balanceVisible={balanceVisible} setBalanceVisible={setBalanceVisible} stocks={stocks} holdings={holdings} cashBalance={cashBalance} transactions={transactions} />;
      break;
    case 'markets':
      content = <MarketsScreen openTrade={openStock} onBack={tabBackProp} stocks={stocks} />;
      break;
    case 'portfolio':
      content = <PortfolioScreen openTrade={openStock} onBack={tabBackProp} stocks={stocks} holdings={holdings} />;
      break;
    case 'wallet':
      content = <WalletScreen go={go} onBack={tabBackProp} cashBalance={cashBalance} web3Wallet={web3Wallet} transactions={transactions} />;
      break;
    case 'profile':
      content = <ProfileScreen onBack={tabBackProp} user={user} onLogout={handleLogout} />;
      break;
    case 'detail':
      content = <StockDetailScreen stock={selectedStock} onBack={back} holdings={holdings} />;
      break;
    case 'deposit':
      content = <DepositMethodScreen go={go} onBack={back} />;
      break;
    case 'deposit-upi':
      content = <DepositUPIScreen onBack={back} />;
      break;
    case 'deposit-crypto':
      content = <DepositCryptoScreen onBack={back} />;
      break;
    case 'deposit-card':
      content = <DepositCardScreen onBack={back} />;
      break;
    default:
      content = <HomeScreen go={go} openTrade={openStock} balanceVisible={balanceVisible} setBalanceVisible={setBalanceVisible} stocks={stocks} holdings={holdings} cashBalance={cashBalance} transactions={transactions} />;
  }

  // Tabs visible on main screens (not on deposit flows for focus)
  const tabScreens = ['home', 'markets', 'portfolio', 'wallet', 'profile', 'detail'];
  const showTabs = tabScreens.includes(screen);

  // Detail screen has a sticky bottom Buy/Sell bar (above tabs, below modal)
  const showDetailBar = screen === 'detail' && selectedStock;

  // Reserve space at bottom of scroll for tabs (and detail bar if present)
  const scrollPaddingBottom = showDetailBar ? 154 : (showTabs ? 80 : 0);

  const shellStyle = {
    minHeight: '100vh',
    background: C.shellBg,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '20px 0', ...sans, color: C.ink,
  };
  const phoneStyle = {
    width: '100%', maxWidth: 420,
    height: 'min(100vh, 880px)',
    background: C.bg,
    border: `1px solid ${C.border}`,
    position: 'relative', overflow: 'hidden',
    boxShadow: '0 30px 80px rgba(0, 0, 0, 0.12)',
  };

  // Auth gate — show login/register screen when not authenticated
  if (!token) {
    return (
      <div style={shellStyle}>
        <style>{`* { box-sizing: border-box; } body { background: #e7e5e4; }`}</style>
        <div style={phoneStyle}>
          <div style={{ height: '100%', overflowY: 'auto' }}>
            {authScreen === 'register'
              ? <RegisterScreen onLogin={handleLogin} goLogin={() => setAuthScreen('login')} />
              : <LoginScreen onLogin={handleLogin} goRegister={() => setAuthScreen('register')} />
            }
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={shellStyle}>
      <style>{`
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes tickerScroll { 0% { transform: translateX(0); } 100% { transform: translateX(-33.33%); } }
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        button { font-family: inherit; color: inherit; }
        input { font-family: inherit; }
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        input[type="number"] { -moz-appearance: textfield; }
        ::-webkit-scrollbar { display: none; }
        body { background: #e7e5e4; }
      `}</style>

      <div style={phoneStyle}>
        {/* Scroll container */}
        <div style={{
          height: '100%',
          overflowY: 'auto',
          overflowX: 'hidden',
          paddingBottom: scrollPaddingBottom,
        }}>
          {content}
        </div>

        {/* Buy/Sell sticky bar — only on detail screen, sits ABOVE tabs */}
        {showDetailBar && (
          <div style={{
            position: 'absolute',
            left: 0, right: 0,
            bottom: 76,                              // sits right above 76px-tall tab bar
            padding: '12px 22px',
            background: C.bg,
            borderTop: `1px solid ${C.border}`,
            display: 'flex', gap: 10,
            zIndex: 30,
          }}>
            <button type="button" onClick={() => setTradeSide('sell')} style={{
              flex: 1, padding: '15px', borderRadius: 14,
              background: 'transparent', color: C.loss,
              border: `1px solid ${C.loss}40`,
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}>Sell</button>
            <button type="button" onClick={() => setTradeSide('buy')} style={{
              flex: 1.5, padding: '15px', borderRadius: 14,
              background: C.gain, color: C.bg, border: 'none',
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}>Buy {selectedStock.sym}</button>
          </div>
        )}

        {/* Tab bar */}
        {showTabs && <TabBar tab={tab} onTabClick={onTabClick} />}

        {/* Trade modal */}
        {tradeSide && selectedStock && (
          <TradeModal
            stock={selectedStock}
            side={tradeSide}
            onClose={() => setTradeSide(null)}
            web3Wallet={web3Wallet}
            fetchPortfolio={fetchPortfolio}
          />
        )}
      </div>
    </div>
  );
}

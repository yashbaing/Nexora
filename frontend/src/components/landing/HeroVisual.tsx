"use client";

const TICKERS = [
  { symbol: "AAPL", price: "214.08", change: "+1.42%", up: true },
  { symbol: "TSLA", price: "248.50", change: "+3.18%", up: true },
  { symbol: "NVDA", price: "131.28", change: "-0.64%", up: false },
  { symbol: "MSFT", price: "428.90", change: "+0.91%", up: true },
  { symbol: "META", price: "572.14", change: "+2.05%", up: true },
  { symbol: "AMZN", price: "198.42", change: "+1.12%", up: true },
];

const CHART = [42, 48, 45, 52, 49, 58, 55, 63, 60, 68, 72, 70, 78, 84, 81, 90, 88, 96];

export default function HeroVisual() {
  const max = Math.max(...CHART);
  const min = Math.min(...CHART);
  const points = CHART.map((v, i) => {
    const x = (i / (CHART.length - 1)) * 100;
    const y = 100 - ((v - min) / (max - min)) * 72 - 12;
    return `${x},${y}`;
  }).join(" ");
  const area = `0,100 ${points} 100,100`;

  return (
    <div className="nx-hero-visual" aria-hidden="true">
      <div className="nx-hero-visual__glow" />
      <div className="nx-hero-visual__grid" />

      <div className="nx-hero-visual__tape">
        <div className="nx-hero-visual__tape-track">
          {[...TICKERS, ...TICKERS, ...TICKERS].map((t, i) => (
            <span key={`${t.symbol}-${i}`} className="nx-tape-item">
              <strong>{t.symbol}</strong>
              <em>${t.price}</em>
              <span className={t.up ? "up" : "down"}>{t.change}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="nx-hero-visual__stage">
        <div className="nx-device">
          <div className="nx-device__bezel">
            <div className="nx-device__screen">
              <div className="nx-device__top">
                <span>Portfolio</span>
                <span className="nx-live">LIVE</span>
              </div>
              <div className="nx-device__value">$48,291.60</div>
              <div className="nx-device__delta">+ $1,842.30 · 24h</div>

              <svg className="nx-device__chart" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="nxChartFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(0,212,126,0.45)" />
                    <stop offset="100%" stopColor="rgba(0,212,126,0)" />
                  </linearGradient>
                </defs>
                <polygon points={area} fill="url(#nxChartFill)" />
                <polyline
                  points={points}
                  fill="none"
                  stroke="#00d47e"
                  strokeWidth="1.8"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>

              <div className="nx-device__rows">
                {TICKERS.slice(0, 3).map((t) => (
                  <div key={t.symbol} className="nx-device__row">
                    <span>{t.symbol}</span>
                    <span>${t.price}</span>
                    <span className={t.up ? "up" : "down"}>{t.change}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

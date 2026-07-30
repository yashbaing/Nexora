import Reveal from "./Reveal";

const STATS = [
  { value: "<2s", label: "Trade settlement time" },
  { value: "12+", label: "Tokenized assets live" },
  { value: "24/7", label: "Market availability" },
  { value: "0", label: "Custody of your funds by us" },
];

export default function Stats() {
  return (
    <section className="relative mx-auto max-w-6xl px-5 sm:px-8">
      <Reveal>
        <div className="glass-card grid grid-cols-2 gap-6 rounded-3xl px-6 py-10 sm:grid-cols-4 sm:px-10">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="gradient-text font-mono-num text-3xl font-bold sm:text-4xl">
                {stat.value}
              </p>
              <p className="mt-2 text-xs text-white/50 sm:text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

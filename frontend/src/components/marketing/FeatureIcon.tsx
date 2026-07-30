import {
  Activity,
  CandlestickChart,
  Globe,
  Layers,
  PenTool,
  Scissors,
  ShieldCheck,
  Zap,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  activity: Activity,
  shield: ShieldCheck,
  signature: PenTool,
  scissors: Scissors,
  candles: CandlestickChart,
  globe: Globe,
  layers: Layers,
  zap: Zap,
};

export function FeatureIcon({ name, size = 18 }: { name: string; size?: number }) {
  const Icon = ICONS[name] ?? Layers;
  return (
    <span className="grid h-10 w-10 place-items-center rounded-xl border border-mint/22 bg-mint/10 text-mint">
      <Icon size={size} />
    </span>
  );
}

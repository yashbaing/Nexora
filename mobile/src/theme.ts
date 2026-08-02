export const C = {
  bg: "#ffffff",
  bg2: "#fafaf9",
  card: "#f5f5f4",
  cardHi: "#e7e5e4",
  border: "#e7e5e4",
  borderHi: "#d6d3d1",
  ink: "#0c0a09",
  inkDim: "#57534e",
  inkMute: "#a8a29e",
  accent: "#0c0a09",
  accentInk: "#ffffff",
  gain: "#16a34a",
  gainSoft: "rgba(22, 163, 74, 0.08)",
  loss: "#dc2626",
  lossSoft: "rgba(220, 38, 38, 0.08)",
  ember: "#ea580c",
};

export const fmtUSD = (n: number) =>
  "$" +
  Number(n || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

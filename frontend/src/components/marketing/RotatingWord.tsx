"use client";

import { useEffect, useState } from "react";

/**
 * Cross-fades through a list of words without reflowing the headline: every word
 * is rendered stacked, and the widest one (rendered invisibly) sets the width.
 */
export function RotatingWord({
  words,
  intervalMs = 2200,
  className = "",
  wordClassName = "",
}: {
  words: readonly string[];
  intervalMs?: number;
  className?: string;
  /**
   * Applied to each word rather than the wrapper. Gradient text has to live on the
   * word itself: the per-word opacity transition creates a stacking context, which
   * would exclude it from an ancestor's `background-clip: text`.
   */
  wordClassName?: string;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (words.length < 2) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % words.length), intervalMs);
    return () => clearInterval(timer);
  }, [words.length, intervalMs]);

  const widest = words.reduce((a, b) => (b.length > a.length ? b : a), words[0] ?? "");

  return (
    <span className={`relative inline-grid align-baseline ${className}`}>
      {/* Sizer: reserves the width of the longest word so nothing jumps. */}
      <span aria-hidden className="invisible col-start-1 row-start-1 whitespace-nowrap">
        {widest}
      </span>
      {words.map((word, i) => (
        <span
          key={word}
          aria-hidden={i !== index}
          className={`col-start-1 row-start-1 whitespace-nowrap transition-all duration-700 ease-out ${wordClassName}`}
          style={{
            opacity: i === index ? 1 : 0,
            transform: i === index ? "translateY(0)" : "translateY(0.2em)",
          }}
        >
          {word}
        </span>
      ))}
    </span>
  );
}

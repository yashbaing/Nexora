"use client";

import Link from "next/link";
import { GitBranch, Share2, Zap } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="border-t border-white/5 bg-[#040408]">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-12">
        <div className="grid md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center">
                <Zap className="w-4 h-4 text-[#06060b]" strokeWidth={2.5} />
              </div>
              <span className="font-semibold">Tokenssized</span>
            </Link>
            <p className="text-sm text-zinc-500 max-w-sm leading-relaxed">
              The next generation of equity trading. Tokenized stocks, real-time data,
              on-chain settlement — built on Avalanche.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-4 text-zinc-300">Product</h4>
            <ul className="space-y-2 text-sm text-zinc-500">
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#stocks" className="hover:text-white transition-colors">Markets</a></li>
              <li><Link href="/app" className="hover:text-white transition-colors">Open App</Link></li>
              <li><a href="#waitlist" className="hover:text-white transition-colors">Waitlist</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-4 text-zinc-300">Connect</h4>
            <div className="flex gap-3">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg landing-glass flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <Share2 className="w-4 h-4" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg landing-glass flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                aria-label="GitHub"
              >
                <GitBranch className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between gap-4 text-xs text-zinc-600">
          <p>© {new Date().getFullYear()} Tokenssized. All rights reserved.</p>
          <p>Not financial advice. Trading involves risk.</p>
        </div>
      </div>
    </footer>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";

import { navLinks, site } from "@/lib/site";
import { Logo } from "./Logo";

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "border-b border-white/8 bg-void/80 backdrop-blur-xl"
          : "border-b border-transparent"
      }`}
      style={{ height: "var(--nav-h)" }}
    >
      <nav className="mx-auto flex h-full max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
        <Link href="/" aria-label={`${site.name} home`} className="transition-opacity hover:opacity-80">
          <Logo />
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm text-ash transition-colors hover:bg-white/6 hover:text-chalk"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <a href={site.appPath} className="btn btn-ghost !py-2.5 !text-[13px]">
            Open app
            <ArrowUpRight size={14} />
          </a>
          <Link href="/#waitlist" className="btn btn-primary !py-2.5 !text-[13px]">
            Join the waitlist
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="grid h-10 w-10 place-items-center rounded-full border border-white/12 bg-white/5 text-chalk lg:hidden"
        >
          {open ? <X size={17} /> : <Menu size={17} />}
        </button>
      </nav>

      {open && (
        <div className="fixed inset-x-0 top-[var(--nav-h)] bottom-0 z-40 border-t border-white/8 bg-void/97 px-5 pt-6 backdrop-blur-xl lg:hidden">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="display border-b border-white/6 py-4 text-3xl text-chalk"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="mt-8 flex flex-col gap-3">
            <Link href="/#waitlist" onClick={() => setOpen(false)} className="btn btn-primary w-full">
              Join the waitlist
            </Link>
            <a href={site.appPath} className="btn btn-ghost w-full">
              Open the app
              <ArrowUpRight size={15} />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { YantrikMark } from "@/os/YantrikMark";
import { Icon } from "@/os/Icon";
import { LiveDot } from "./LivePill";
import { OS_REPO } from "@/lib/os-repo";
import { ThemeToggle } from "./ThemeToggle";

// Live · Download · Minds · Security · Apps · Docs · GitHub (design/redesign-plan-2026-10-01.md).
// /live is a framework-free page outside the app, so it is a plain link, never a client route.
const NAV = [
  { href: "/live/", label: "Live", live: true },
  { href: "/download", label: "Download" },
  { href: "/minds", label: "Minds" },
  { href: "/security", label: "Security" },
  { href: "/apps", label: "Apps" },
  { href: "/docs", label: "Docs" },
] as const;

/**
 * The site's header, in the status bar's grammar: the mark and "Yantrik" on the left, the pages
 * on the right, the current one drawn as the taskbar draws its active window. Below 900px the
 * pages fold behind a Menu button (a disclosure: aria-expanded, Escape closes, focus returns),
 * every target 44px or more. The theme toggle is the last item, in the row and in the menu.
 */
export function SiteHeader() {
  const path = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const navId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const current = (href: string) => {
    const h = href.replace(/\/$/, "");
    return path === h || path === `${h}/` ? "page" : undefined;
  };

  return (
    <header className="s-header">
      <div className="s-wrap s-header-row">
        <Link className="s-brand" href="/" prefetch={false} aria-label="Yantrik OS, home">
          <YantrikMark size={22} />
          <span>Yantrik OS</span>
        </Link>
        <button
          ref={button}
          type="button"
          className="s-menu-btn"
          aria-expanded={open}
          aria-controls={navId}
          onClick={() => setOpen((o) => !o)}
        >
          <Icon name={open ? "close" : "apps"} size={16} tint="var(--y-text-primary)" />
          Menu
        </button>
        <nav id={navId} className="s-nav" data-open={open} aria-label="Pages">
          {NAV.map((item) =>
            "live" in item ? (
              <a key={item.href} href={item.href} aria-current={current(item.href)}>
                <LiveDot />
                {item.label}
              </a>
            ) : (
              <Link key={item.href} href={item.href} prefetch={false} aria-current={current(item.href)} onClick={() => setOpen(false)}>
                {item.label}
              </Link>
            ),
          )}
          <a href={OS_REPO} className="s-ext" rel="noopener">
            GitHub
            <span aria-hidden="true">↗</span>
          </a>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}

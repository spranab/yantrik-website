import type { ReactNode } from "react";
import "@/app/site.css";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

/** Header, the page's content as #main (the skip link's target, layout.tsx), footer. */
export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main id="main" tabIndex={-1} style={{ outline: "none" }}>
        {children}
      </main>
      <SiteFooter />
    </>
  );
}

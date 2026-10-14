import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { legalDocs } from "@/lib/legal";

const nav = [
  { to: "/features", label: "Features" },
  { to: "/products", label: "Products" },
  { to: "/pricing", label: "Pricing" },
  { to: "/coverage", label: "Coverage" },
  { to: "/safety", label: "Safety" },
  { to: "/support", label: "Support" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="h-10"><Logo compact /></Link>
        <nav className="hidden items-center gap-6 lg:flex">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} className="font-display text-xs tracking-[0.2em] text-muted-foreground uppercase transition hover:text-primary-glow hover:text-glow" activeProps={{ className: "text-primary-glow text-glow" }}>{n.label}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/waitlist" className="btn-neon hidden !py-2 sm:inline-flex">Get NanoDrift</Link>
          <button onClick={() => setOpen(!open)} className="btn-outline-neon !px-3 !py-2 lg:hidden" aria-label="Menu">{open ? "✕" : "☰"}</button>
        </div>
      </div>
      {open && (
        <nav className="border-t px-4 py-4 lg:hidden">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="block py-2 font-display text-sm tracking-[0.2em] uppercase text-muted-foreground hover:text-primary-glow">{n.label}</Link>
          ))}
          <Link to="/waitlist" onClick={() => setOpen(false)} className="btn-neon mt-3 w-full">Get NanoDrift</Link>
        </nav>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-3">
        <div>
          <Logo compact />
          <p className="mt-4 font-display text-sm tracking-[0.2em] text-primary-glow">BRIDGING THE UNBRIDGEABLE.</p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {nav.map((n) => <Link key={n.to} to={n.to} className="text-muted-foreground hover:text-primary-glow">{n.label}</Link>)}
        </div>
        <div className="space-y-2 text-sm">
          <div className="eyebrow">Legal</div>
          {legalDocs.map((d) => (
            <Link key={d.slug} to="/legal/$doc" params={{ doc: d.slug }} className="block text-muted-foreground hover:text-primary-glow">{d.title}</Link>
          ))}
        </div>
      </div>
      <div className="border-t px-4 py-6 text-center text-xs text-muted-foreground">
        NanoDrift does not support removing or defeating emissions systems; all tunes are emissions-compliant. © {new Date().getFullYear()} NanoDrift.
      </div>
    </footer>
  );
}

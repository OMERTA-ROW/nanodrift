import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { legalDocs } from "@/lib/legal";
import { useSession } from "@/hooks/use-session";
import { supabase } from "@/integrations/supabase/client";

const nav = [
  { to: "/pre-diagnose", label: "Pre-Diagnose" },
  { to: "/features", label: "Features" },
  { to: "/products", label: "Products" },
  { to: "/pricing", label: "Pricing" },
  { to: "/maintenance", label: "Maintenance" },
  { to: "/coverage", label: "Coverage" },
  { to: "/safety", label: "Safety" },
  { to: "/connect", label: "Connect AI" },
  { to: "/support", label: "Support" },
] as const;

function AccountButtons({ onDone, mobile = false }: { onDone?: () => void; mobile?: boolean }) {
  const { session } = useSession();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const cls = mobile ? "btn-outline-neon w-full" : "btn-outline-neon !py-2";
  if (session) {
    return (
      <>
        <Link to="/garage" onClick={onDone} className={cls}>My Garage</Link>
        <button
          className={cls}
          onClick={async () => {
            await qc.cancelQueries(); qc.clear();
            await supabase.auth.signOut();
            onDone?.();
            navigate({ to: "/", replace: true });
          }}
        >Log out</button>
      </>
    );
  }
  return (
    <>
      <Link to="/auth" search={{ mode: "login" }} onClick={onDone} className={cls}>Log in</Link>
      <Link to="/auth" search={{ mode: "signup" }} onClick={onDone} className={mobile ? "btn-neon w-full" : "btn-neon !py-2"}>Sign up</Link>
    </>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
        <Link to="/" className="h-10 shrink-0"><Logo compact /></Link>
        <nav className="hidden items-center gap-4 xl:flex">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} className="font-display text-[0.7rem] tracking-[0.18em] text-muted-foreground uppercase transition hover:text-primary-glow hover:text-glow" activeProps={{ className: "text-primary-glow text-glow" }}>{n.label}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 sm:flex"><AccountButtons /></div>
          <button onClick={() => setOpen(!open)} className="btn-outline-neon !px-3 !py-2 xl:hidden" aria-label="Menu">{open ? "✕" : "☰"}</button>
        </div>
      </div>
      {open && (
        <nav className="border-t px-4 py-4 xl:hidden">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="block py-2 font-display text-sm tracking-[0.2em] uppercase text-muted-foreground hover:text-primary-glow">{n.label}</Link>
          ))}
          <div className="mt-3 grid gap-2 sm:hidden"><AccountButtons mobile onDone={() => setOpen(false)} /></div>
          <Link to="/waitlist" onClick={() => setOpen(false)} className="btn-neon mt-3 w-full">Join the waitlist</Link>
        </nav>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-4">
        <div>
          <Logo compact />
          <p className="mt-4 font-display text-sm tracking-[0.2em] text-primary-glow">BRIDGING THE UNBRIDGEABLE.</p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm md:col-span-2">
          {nav.map((n) => <Link key={n.to} to={n.to} className="text-muted-foreground hover:text-primary-glow">{n.label}</Link>)}
          <Link to="/waitlist" className="text-muted-foreground hover:text-primary-glow">Join the waitlist</Link>
          <Link to="/garage" className="text-muted-foreground hover:text-primary-glow">My Garage</Link>
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

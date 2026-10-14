import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Section, seo } from "@/components/Section";
import { AgentBubble, AgentHelmet } from "@/components/brand/Agent";
import { kits, plans, products } from "@/lib/catalog";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/waitlist")({
  validateSearch: (s: Record<string, unknown>): { interest?: string | undefined } => ({
    interest: typeof s["interest"] === "string" ? s["interest"] : undefined,
  }),
  head: () => seo("Join the waitlist — NanoDrift", "Reserve your NanoDrift adapter and plan before launch."),
  component: Waitlist,
});

const field = "w-full rounded-md border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:shadow-[var(--glow-sm)]";

function Waitlist() {
  const { interest } = Route.useSearch();
  const [done, setDone] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const options = [...kits.map((k) => k.name), ...products.map((p) => p.name), ...plans.map((p) => p.name)];

  return (
    <Section>
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <div className="eyebrow">Get NanoDrift</div>
          <h1 className="mt-3 text-4xl font-black md:text-5xl text-glow">Join the waitlist.</h1>
          <p className="mt-4 text-muted-foreground">Checkout opens soon. Reserve your spot and the agent will ping you first.</p>
          <AgentHelmet className="animate-float mt-8 hidden h-56 w-56 lg:block" />
        </div>
        <div className="holo-panel holo-scan p-6 md:p-8">
          {done ? (
            <AgentBubble>You're on the list, {done}. I'll reach out the moment NanoDrift is ready to ship.</AgentBubble>
          ) : (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                const name = String(f.get("name") || "").trim();
                setBusy(true); setErr(null);
                const { error } = await supabase.from("waitlist").insert({
                  name, email: String(f.get("email")).trim(),
                  vehicle: String(f.get("vehicle") || "").trim() || null,
                  interest: String(f.get("interest") || "") || null,
                });
                setBusy(false);
                if (error) return setErr("Couldn't save your spot. Check your email and try again.");
                setDone(name.split(" ")[0] || name);
              }}
              className="relative z-[2] space-y-4"
            >
              <input name="name" required placeholder="Name" maxLength={100} className={field} />
              <input name="email" type="email" required placeholder="Email" maxLength={255} className={field} />
              <input name="vehicle" placeholder="Vehicle (year, make, model)" maxLength={120} className={field} />
              <select name="interest" defaultValue={interest && options.includes(interest) ? interest : options[0]} className={field}>
                {options.map((o) => <option key={o}>{o}</option>)}
              </select>
              {err && <p className="text-sm text-gold">{err}</p>}
              <button type="submit" disabled={busy} className="btn-neon w-full">{busy ? "Saving…" : "Reserve my spot"}</button>
            </form>
          )}
        </div>
      </div>
    </Section>
  );
}

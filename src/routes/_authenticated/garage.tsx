import { familyFor } from "@/lib/parts-catalog";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { PageHero, Section, seo } from "@/components/Section";
import { AgentBubble } from "@/components/brand/Agent";
import { supabase } from "@/integrations/supabase/client";
import { checkCoverage } from "@/lib/nanodrift-data";
import { formatPrice, plans } from "@/lib/catalog";
import { premiumTiers, unlockState } from "@/lib/premium-tiers";

export const Route = createFileRoute("/_authenticated/garage")({
  staticData: { sitemap: false },
  head: () => seo("My Garage — NanoDrift", "Your vehicles, plan and signed agreements."),
  component: Garage,
});

const field = "w-full rounded-md border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:shadow-[var(--glow-sm)]";

function useGarage() {
  return useQuery({
    queryKey: ["garage"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const uid = u.user!.id;
      const [p, v, s, a] = await Promise.all([
        supabase.from("profiles").select("display_name, phone").eq("id", uid).maybeSingle(),
        supabase.from("vehicles").select("id, make, model, year").order("created_at"),
        supabase.from("subscriptions").select("plan_id, status, renews_at").eq("user_id", uid).maybeSingle(),
        supabase.from("agreements").select("id, title, plan_id, tier_id, signature_kind, agreement_version, signed_at").order("signed_at", { ascending: false }),
      ]);
      return { uid, email: u.user!.email ?? "", profile: p.data, vehicles: v.data ?? [], sub: s.data, agreements: a.data ?? [] };
    },
  });
}

function Garage() {
  const qc = useQueryClient();
  const { data, isLoading } = useGarage();
  const [saved, setSaved] = useState(false);
  const refresh = () => qc.invalidateQueries({ queryKey: ["garage"] });

  if (isLoading || !data) return <Section><p className="text-muted-foreground">Loading your garage…</p></Section>;
  const premium = premiumTiers.find((t) => t.id === data.sub?.plan_id);
  const plan = premium ? { name: premium.name, pricePerYear: premium.pricePerYear } : plans.find((p) => p.id === (data.sub?.plan_id ?? "core")) ?? plans[0]!;

  return (
    <>
      <PageHero eyebrow="My Garage" title={`Welcome, ${data.profile?.display_name || "driver"}.`} intro="Add your vehicles, check your plan and review your signed agreements." />
      <Section>
        <AgentBubble className="mb-10 max-w-xl">Add your rides and I'll tell you which are ready for launch. Once your device ships, live diagnostics show up right here.</AgentBubble>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="holo-panel p-6 lg:col-span-2">
            <h2 className="eyebrow">Vehicles</h2>
            <ul className="mt-4 space-y-3">
              {data.vehicles.length === 0 && <li className="text-sm text-muted-foreground">No vehicles yet.</li>}
              {data.vehicles.map((v) => (
                <li key={v.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3">
                  <div>
                    <div className="font-bold">{v.year} {v.make} {v.model}</div>
                    <div className="text-xs text-muted-foreground">{checkCoverage(v.make, v.model, v.year).message}</div>
                  </div>
                  <div className="flex gap-2">
                    <Link to="/pre-diagnose" search={{ make: v.make, model: v.model, year: v.year }} className="btn-outline-neon !px-3 !py-1.5 text-xs">Pre-Diagnose</Link>
                    <Link to="/parts" search={{ family: familyFor(v.make, v.model), vehicle: `${v.year} ${v.make} ${v.model}` }} className="btn-outline-neon !px-3 !py-1.5 text-xs">Find parts</Link>
                    <button onClick={async () => { await supabase.from("vehicles").delete().eq("id", v.id); refresh(); }} className="btn-outline-neon !px-3 !py-1.5 text-xs">Remove</button>
                  </div>
                </li>
              ))}
            </ul>
            <form
              className="mt-6 grid gap-3 sm:grid-cols-[1fr_1fr_7rem_auto]"
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const f = new FormData(form);
                const { error } = await supabase.from("vehicles").insert({ user_id: data.uid, make: String(f.get("make")).trim(), model: String(f.get("model")).trim(), year: Number(f.get("year")) });
                if (!error) { form.reset(); refresh(); }
              }}
            >
              <input name="make" required maxLength={60} placeholder="Make" className={field} />
              <input name="model" required maxLength={60} placeholder="Model" className={field} />
              <input name="year" required type="number" min={1900} max={2100} placeholder="Year" className={field} />
              <button className="btn-neon">Add</button>
            </form>
          </div>

          <div className="holo-panel p-6">
            <h2 className="eyebrow">Plan</h2>
            <div className="mt-3 text-2xl font-black text-glow">{plan.name}</div>
            <div className="text-sm text-muted-foreground">{formatPrice(plan.pricePerYear)} · {data.sub?.status === "active" ? "Active" : "Activates when your device ships"}</div>
            <Link to="/pricing" className="btn-outline-neon mt-5 w-full">Compare plans</Link>
          </div>

          <div className="holo-panel p-6 lg:col-span-2">
            <h2 className="eyebrow">Signed agreements</h2>
            {data.agreements.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">No signed agreements yet.</p>
            ) : (
              <ul className="mt-3 space-y-2">{data.agreements.map((a) => <li key={a.id} className="rounded-md border p-3 text-sm"><span className="font-bold">{a.title}</span> · signed {new Date(a.signed_at).toLocaleString()}{a.signature_kind && <> · {a.signature_kind} signature</>}{a.agreement_version && <> · v{a.agreement_version}</>}</li>)}</ul>
            )}
          </div>

          <div className="holo-panel p-6 lg:col-span-3">
            <h2 className="eyebrow">Premium unlocks</h2>
            <p className="mt-2 text-xs text-muted-foreground">Each unlock needs its own signed agreement and an active matching subscription.</p>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {premiumTiers.map((t) => {
                const state = unlockState(t.id, data.agreements.map((a) => a.tier_id ?? ""), data.sub);
                return (
                  <div key={t.id} className="rounded-md border border-primary/40 p-4">
                    <div className="font-bold text-primary-glow">{t.name}</div>
                    <p className="mt-1 text-xs text-muted-foreground">{t.capability}</p>
                    <div className={`mt-3 text-xs ${state === "unlocked" ? "text-primary-glow" : "text-gold"}`}>● {state === "unlocked" ? "Unlocked" : state === "signed" ? "Signed · activates once its subscription is active" : "Locked · signature required"}</div>
                    {state === "locked" && <Link to="/agreement/$tier" params={{ tier: t.id }} className="btn-outline-neon mt-3 w-full !py-1.5 text-xs">Read & sign</Link>}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="holo-panel p-6">
            <h2 className="eyebrow">Profile</h2>
            <form
              className="mt-4 space-y-3"
              onSubmit={async (e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                const { error } = await supabase.from("profiles").update({ display_name: String(f.get("name")).trim().slice(0, 100), phone: String(f.get("phone")).trim().slice(0, 30) || null, updated_at: new Date().toISOString() }).eq("id", data.uid);
                if (!error) { setSaved(true); refresh(); }
              }}
            >
              <input name="name" defaultValue={data.profile?.display_name ?? ""} maxLength={100} placeholder="Display name" className={field} />
              <input name="phone" defaultValue={data.profile?.phone ?? ""} maxLength={30} placeholder="Phone (optional)" className={field} />
              <div className="text-xs text-muted-foreground">{data.email}</div>
              <button className="btn-neon w-full">Save profile</button>
              {saved && <p className="text-xs text-primary-glow">Saved.</p>}
            </form>
          </div>
        </div>
      </Section>
    </>
  );
}

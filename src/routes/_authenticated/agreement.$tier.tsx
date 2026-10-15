import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { PageHero, Section, seo } from "@/components/Section";
import { supabase } from "@/integrations/supabase/client";
import { AGREEMENT_VERSION, agreementFor, premiumTiers } from "@/lib/premium-tiers";

export const Route = createFileRoute("/_authenticated/agreement/$tier")({
  staticData: { sitemap: false },
  loader: ({ params }) => {
    const tier = premiumTiers.find((t) => t.id === params.tier);
    if (!tier) throw notFound();
    return { tier };
  },
  head: () => ({ ...seo("Sign agreement — NanoDrift", "Review and sign your NanoDrift mini-license."), meta: [{ title: "Sign agreement — NanoDrift" }, { name: "robots", content: "noindex" }] }),
  component: SignAgreement,
});

const field = "w-full rounded-md border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:shadow-[var(--glow-sm)]";

function SignaturePad({ onChange }: { onChange: (dataUrl: string | null) => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const inked = useRef(0);
  useEffect(() => {
    const c = ref.current!; const g = c.getContext("2d")!;
    c.width = c.offsetWidth * 2; c.height = 320;
    g.scale(2, 2); g.lineWidth = 2.5; g.lineCap = "round"; g.strokeStyle = "#e9c46a";
  }, []);
  const pos = (e: React.PointerEvent) => { const r = ref.current!.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top] as const; };
  return (
    <div>
      <canvas
        ref={ref}
        aria-label="Draw your signature"
        className="h-40 w-full touch-none rounded-md border border-primary/50 bg-background"
        onPointerDown={(e) => { drawing.current = true; const g = ref.current!.getContext("2d")!; const [x, y] = pos(e); g.beginPath(); g.moveTo(x, y); ref.current!.setPointerCapture(e.pointerId); }}
        onPointerMove={(e) => { if (!drawing.current) return; const g = ref.current!.getContext("2d")!; const [x, y] = pos(e); g.lineTo(x, y); g.stroke(); inked.current++; }}
        onPointerUp={() => { drawing.current = false; onChange(inked.current > 15 ? ref.current!.toDataURL("image/png") : null); }}
      />
      <button type="button" className="mt-2 text-xs text-muted-foreground hover:text-primary-glow" onClick={() => { const c = ref.current!; c.getContext("2d")!.clearRect(0, 0, c.width, c.height); inked.current = 0; onChange(null); }}>Clear</button>
    </div>
  );
}

function SignAgreement() {
  const { tier } = Route.useLoaderData();
  const doc = agreementFor(tier);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [kind, setKind] = useState<"typed" | "drawn">("typed");
  const [typed, setTyped] = useState("");
  const [drawn, setDrawn] = useState<string | null>(null);
  const [ack, setAck] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const signature = kind === "typed" ? typed.trim() : drawn;
  const valid = ack && !!signature && (kind === "drawn" || typed.trim().length >= 2);

  return (
    <>
      <PageHero eyebrow={`${tier.name} · Mini-license`} title="Read and sign before you unlock." intro="This agreement is tied to your account. The capability turns on only after you sign and the matching subscription is active." />
      <Section>
        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <article className="holo-panel max-h-[70vh] overflow-y-auto p-6 md:p-8">
            <h2 className="font-display text-2xl font-bold text-glow">{doc.title}</h2>
            <p className="mt-1 text-xs text-muted-foreground">Version {AGREEMENT_VERSION}</p>
            {doc.sections.map((s) => (
              <section key={s.title} className="mt-6">
                <h3 className="eyebrow">{s.title}</h3>
                {s.body.map((p) => <p key={p} className="mt-2 text-sm text-secondary-foreground">{p}</p>)}
              </section>
            ))}
          </article>

          <form
            className="holo-panel space-y-5 p-6"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!valid || !signature) return;
              setBusy(true); setError(null);
              const { error } = await supabase.rpc("sign_premium_agreement", { _tier: tier.id, _signature: signature, _kind: kind, _version: AGREEMENT_VERSION, _acknowledged: ack });
              setBusy(false);
              if (error) { setError(error.message.includes("Already signed") ? "You've already signed this agreement." : "Couldn't save your signature. Please try again."); return; }
              await qc.invalidateQueries({ queryKey: ["garage"] });
              navigate({ to: "/garage" });
            }}
          >
            <div className="eyebrow">Your signature</div>
            <div className="flex gap-2">
              {(["typed", "drawn"] as const).map((k) => (
                <button key={k} type="button" onClick={() => setKind(k)} aria-pressed={kind === k}
                  className={`rounded-full border px-3 py-1 text-xs ${kind === k ? "border-gold text-gold" : "border-primary/50 text-muted-foreground"}`}>{k === "typed" ? "Type it" : "Draw it"}</button>
              ))}
            </div>
            {kind === "typed" ? (
              <div>
                <input value={typed} onChange={(e) => setTyped(e.target.value)} maxLength={100} placeholder="Type your full legal name" className={field} aria-label="Typed signature" />
                {typed.trim() && <p className="mt-3 font-display text-2xl italic text-gold">{typed}</p>}
              </div>
            ) : (
              <SignaturePad onChange={setDrawn} />
            )}
            <label className="flex items-start gap-3 text-sm">
              <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} className="mt-1 accent-primary" />
              <span>I've read this agreement, I understand what {tier.name} does, and I accept accountability for how I use it. All tunes stay emissions-compliant.</span>
            </label>
            {error && <p className="text-sm text-gold">{error}</p>}
            <button type="submit" disabled={!valid || busy} className="btn-neon w-full disabled:opacity-40">{busy ? "Signing…" : "Sign agreement"}</button>
            <Link to="/garage" className="block text-center text-xs text-muted-foreground hover:text-primary-glow">Back to My Garage</Link>
          </form>
        </div>
      </Section>
    </>
  );
}

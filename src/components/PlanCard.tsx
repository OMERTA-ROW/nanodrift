import { Link } from "@tanstack/react-router";
import { formatPrice, type Plan } from "@/lib/catalog";
import { cn } from "@/lib/utils";

export function PlanCard({ plan, featured }: { plan: Plan; featured?: boolean }) {
  return (
    <div className={cn("holo-panel holo-scan flex flex-col p-6", featured && "border-primary/70 shadow-[var(--glow-lg)]")}>
      <div className="eyebrow">{plan.name}</div>
      <div className="mt-3 font-display text-3xl font-black text-glow">{formatPrice(plan.pricePerYear)}</div>
      <p className="mt-2 text-sm text-muted-foreground">{plan.blurb}</p>
      <ul className="mt-5 flex-1 space-y-2 text-sm">
        {plan.features.map((f) => <li key={f} className="flex gap-2"><span className="text-primary">◆</span>{f}</li>)}
      </ul>
      {plan.agreement && <p className="mt-4 text-xs text-gold">Your own license · signed agreement required</p>}
      <Link to="/waitlist" search={{ interest: plan.name }} className={cn("mt-6", featured ? "btn-neon" : "btn-outline-neon")}>Join the waitlist</Link>
    </div>
  );
}

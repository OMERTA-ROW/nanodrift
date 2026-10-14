import { Link } from "@tanstack/react-router";
import { formatKitPrice, type Kit } from "@/lib/catalog";
import { cn } from "@/lib/utils";

export function KitCard({ kit, featured }: { kit: Kit; featured?: boolean }) {
  return (
    <div className={cn("holo-panel holo-scan flex flex-col p-6", featured && "border-primary/70 shadow-[var(--glow-lg)]")}>
      <div className="eyebrow">{kit.name}</div>
      <div className="mt-3 font-display text-4xl font-black text-glow">{formatKitPrice(kit.price)}</div>
      <p className="mt-2 text-sm text-muted-foreground">{kit.blurb}</p>
      <ul className="mt-5 flex-1 space-y-2 text-sm">
        {kit.includes.map((f) => <li key={f} className="flex gap-2"><span className="text-primary">◆</span>{f}</li>)}
      </ul>
      <Link to="/waitlist" search={{ interest: kit.name }} className={cn("mt-6", featured ? "btn-neon" : "btn-outline-neon")}>Get NanoDrift</Link>
    </div>
  );
}

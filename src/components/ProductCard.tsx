import { Link } from "@tanstack/react-router";
import type { Product } from "@/lib/catalog";
import { HoloFrame } from "@/components/brand/HoloFrame";
import { AdapterArt } from "@/components/brand/AdapterArt";

export function ProductCard({ product }: { product: Product }) {
  return (
    <div className="flex flex-col">
      <HoloFrame dim={!product.forSale}>
        <AdapterArt kind={product.id} className="mx-auto h-44 w-full" />
        {!product.forSale && (
          <div className="mt-2 text-center"><span className="rounded-full border border-gold/60 px-3 py-1 font-display text-[0.6rem] tracking-[0.2em] text-gold">IN DEVELOPMENT</span></div>
        )}
      </HoloFrame>
      <div className="mt-5 px-4">
        <div className="eyebrow">{product.short}</div>
        <h3 className="mt-1 text-lg font-bold">{product.name}</h3>
        <p className="text-sm text-muted-foreground">{product.audience}</p>
        <ul className="mt-3 space-y-1 text-sm text-secondary-foreground">
          {product.bullets.map((b) => <li key={b}>▹ {b}</li>)}
        </ul>
        <div className="mt-4">
          {product.forSale ? (
            <Link to="/waitlist" search={{ interest: product.name }} className="btn-neon w-full">Get NanoDrift</Link>
          ) : (
            <Link to="/waitlist" search={{ interest: product.name }} className="btn-outline-neon w-full">{product.status}</Link>
          )}
        </div>
      </div>
    </div>
  );
}

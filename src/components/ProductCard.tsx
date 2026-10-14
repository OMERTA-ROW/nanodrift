import { Link } from "@tanstack/react-router";
import type { Product } from "@/lib/catalog";
import { productImages } from "@/lib/product-images";

export function ProductCard({ product }: { product: Product }) {
  return (
    <div className="flex flex-col">
      <div className="holo-panel holo-scan relative overflow-hidden rounded-[2rem] p-0 transition hover:shadow-[var(--glow-lg)]">
        <img src={productImages[product.id]} alt={`${product.name} in the NanoDrift holographic frame`} width={1024} height={1024} loading="lazy" className={product.forSale ? "aspect-square w-full object-cover" : "aspect-square w-full object-cover opacity-70"} />
        {!product.forSale && (
          <div className="absolute inset-x-0 bottom-3 text-center"><span className="rounded-full border border-gold/60 bg-background/80 px-3 py-1 font-display text-[0.6rem] tracking-[0.2em] text-gold">IN DEVELOPMENT</span></div>
        )}
      </div>
      <div className="mt-5 flex flex-1 flex-col px-1">
        <div className="eyebrow">{product.short}</div>
        <h3 className="mt-1 text-lg font-bold">{product.name}</h3>
        <p className="text-sm text-muted-foreground">{product.audience}</p>
        <ul className="mt-3 flex-1 space-y-1 text-sm text-secondary-foreground">
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

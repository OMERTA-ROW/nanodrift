import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Section, seo } from "@/components/Section";
import { ProductCard } from "@/components/ProductCard";
import { AgentBubble } from "@/components/brand/Agent";
import { products } from "@/lib/catalog";

export const Route = createFileRoute("/products")({
  head: () => seo("Shop adapters — NanoDrift", "NanoDrift OBD-II, J1939 Heavy-Duty and Marine adapters. Aviation adapter in development."),
  component: Products,
});

function Products() {
  return (
    <>
      <PageHero eyebrow="Shop" title="Choose your adapter." intro="Black and purple, NANODRIFT across the top. USB-C to phone or laptop. EVs supported through software." />
      <Section>
        <AgentBubble className="mb-14 max-w-xl">Not sure which one? Cars and light trucks from 1996 on take OBD-II. Powerstroke, Cummins or Duramax — grab the J1939.</AgentBubble>
        <div className="grid gap-14 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </Section>
    </>
  );
}

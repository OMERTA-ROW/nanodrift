import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Section({ eyebrow, title, intro, children, className }: { eyebrow?: string; title?: ReactNode; intro?: ReactNode; children?: ReactNode; className?: string }) {
  return (
    <section className={cn("mx-auto max-w-7xl px-4 py-16 md:py-24", className)}>
      {(eyebrow || title) && (
        <div className="mb-12 max-w-2xl">
          {eyebrow && <div className="eyebrow">{eyebrow}</div>}
          {title && <h2 className="mt-3 text-3xl font-black md:text-4xl">{title}</h2>}
          {intro && <p className="mt-4 text-muted-foreground">{intro}</p>}
        </div>
      )}
      {children}
    </section>
  );
}

export function PageHero({ eyebrow, title, intro }: { eyebrow: string; title: ReactNode; intro: ReactNode }) {
  return (
    <div className="holo-grid holo-scan border-b">
      <div className="mx-auto max-w-7xl px-4 py-20 md:py-28">
        <div className="eyebrow">{eyebrow}</div>
        <h1 className="mt-4 max-w-3xl text-4xl font-black md:text-6xl text-glow">{title}</h1>
        <p className="mt-5 max-w-2xl text-lg text-muted-foreground">{intro}</p>
      </div>
    </div>
  );
}

export function seo(title: string, description: string) {
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  };
}

import { createFileRoute } from "@tanstack/react-router";
import { getRouterInstance } from "@tanstack/react-start";
import { legalDocs } from "@/lib/legal";
import { isSitemapRouteIncluded, sitemapPathForLocation, sitemapStaticPaths, sitemapXML, type SitemapEntry } from "@/lib/sitemap";

const BASE_URL = "https://nanodrift.tech";

export const Route = createFileRoute("/sitemap.xml")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      GET: async () => {
        if (!BASE_URL) {
          return new Response("Sitemap domain not configured", {
            status: 503,
            headers: { "Cache-Control": "no-store" },
          });
        }
        const router = await getRouterInstance();
        const entries: SitemapEntry[] = sitemapStaticPaths(router).map((path) => ({ path }));
        const routeId = "/legal/$doc";
        if (isSitemapRouteIncluded(router.routesById[routeId])) {
          for (const doc of legalDocs) {
            const location = router.buildLocation({ to: "/legal/$doc", params: { doc: doc.slug }, search: () => ({}), hash: "" });
            const path = sitemapPathForLocation(router, location, routeId);
            if (path) entries.push({ path });
          }
        }
        if (entries.length === 0) {
          return new Response(
            'No pages are included in this sitemap. Check route decisions and ancestor exclusions. Setting "exclude-subtree" on the root excludes the entire site.',
            { status: 404, headers: { "Cache-Control": "no-store" } },
          );
        }
        return new Response(sitemapXML(BASE_URL, entries), {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});

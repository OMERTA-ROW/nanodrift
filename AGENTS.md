<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Brand image slots live in src/lib/brand.ts (null = SVG fallback); swap in uploaded logo/agent there so every usage updates at once.
- Shared site content (features, safety rules, coverage, trouble codes) lives in src/lib/nanodrift-data.ts; pages and the MCP connector both read it so answers match the site.
- MCP connector: tools in src/lib/mcp/tools (one per file), registered in src/lib/mcp/index.ts; public by owner choice, so tools only use the anon client and existing RLS.
- Accounts: Cloud auth; signed-in pages live under src/routes/_authenticated (client-side gate). Subscriptions/agreements are read-only to users (written by admin/backend only).
- Products and plans are data in src/lib/catalog.ts; pages render from it so prices stay in one place (covered by src/test/catalog.test.ts).
- 3D scenes live in src/components/hologram and load via React.lazy inside <ClientOnly> so three.js never runs during SSR; models are bundled under public/models (CC0 only).
- The hero 3D semi (src/components/hologram/SemiTruck3D.tsx) is procedural so every internal part is a separately selectable mesh; part info lives in its PARTS map.
- Engine layouts in the 3D teardown come from src/lib/engine-families.ts (generic representative families, always labelled as not an exact vehicle match) so new families need no scene changes.

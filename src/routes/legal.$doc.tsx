import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageHero, Section, seo } from "@/components/Section";
import { legalDocs } from "@/lib/legal";

export const Route = createFileRoute("/legal/$doc")({
  staticData: { sitemap: true },
  loader: ({ params }) => {
    const doc = legalDocs.find((d) => d.slug === params.doc);
    if (!doc) throw notFound();
    return doc;
  },
  head: ({ loaderData }) =>
    loaderData
      ? seo(`${loaderData.title} — NanoDrift`, loaderData.body[0])
      : { meta: [{ title: "Not found — NanoDrift" }, { name: "robots", content: "noindex" }] },
  component: LegalPage,
});

function LegalPage() {
  const doc = Route.useLoaderData();
  return (
    <>
      <PageHero eyebrow="Legal" title={doc.title} intro="Plain-language summary. Full documents will be published at launch." />
      <Section>
        <div className="max-w-3xl space-y-5 text-secondary-foreground">
          {doc.body.map((p) => <p key={p}>{p}</p>)}
        </div>
      </Section>
    </>
  );
}

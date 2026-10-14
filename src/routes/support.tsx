import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero, Section, seo } from "@/components/Section";
import { AgentBubble, AgentHelmet } from "@/components/brand/Agent";

export const Route = createFileRoute("/support")({
  staticData: { sitemap: true },
  head: () => seo("Support — NanoDrift", "Help center, tutorials, ask the AI agent, or talk to a human."),
  component: Support,
});

const cards = [
  ["Help center", "Setup guides, troubleshooting and FAQs."],
  ["Tutorials", "Step-by-step videos for installs, tunes and regen."],
  ["Talk to a human", "Real techs, real answers — when you want a person."],
];

function Support() {
  return (
    <>
      <PageHero eyebrow="Support" title="We've got you." intro="Start with the agent. Escalate to a human any time." />
      <Section>
        <div className="grid gap-6 md:grid-cols-3">
          {cards.map(([t, d]) => (
            <div key={t} className="holo-panel holo-scan p-6">
              <h3 className="font-bold text-primary-glow">{t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{d}</p>
              <Link to="/waitlist" search={{ interest: t ?? "" }} className="btn-outline-neon mt-5">{t === "Talk to a human" ? "Contact us" : "Coming at launch"}</Link>
            </div>
          ))}
        </div>
      </Section>
      <Section eyebrow="Ask the agent" title="Your on-board tech.">
        <div className="grid items-center gap-10 md:grid-cols-[1fr_2fr]">
          <AgentHelmet className="animate-float mx-auto h-56 w-56" />
          <div className="space-y-4">
            <AgentBubble>"Why is my truck in derate?" — I'll read the DEF system, find the cause, and tell you if a safe regen will clear it.</AgentBubble>
            <AgentBubble>"Is my new turbo synced?" — Yes. I detected it on plug-in and adjusted your map automatically.</AgentBubble>
          </div>
        </div>
      </Section>
    </>
  );
}

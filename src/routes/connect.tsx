import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHero, Section, seo } from "@/components/Section";
import { AgentBubble } from "@/components/brand/Agent";

export const Route = createFileRoute("/connect")({
  head: () => seo("Connect your AI — NanoDrift Connector", "Add the NanoDrift Connector to Claude, ChatGPT or any AI assistant that supports custom connectors."),
  component: Connect,
});

function CopyBox({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <code className="flex-1 break-all rounded-md border border-primary/60 bg-background px-4 py-3 font-display text-sm text-primary-glow shadow-[var(--glow-sm)]">{value || "…"}</code>
      <button onClick={async () => { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className="btn-neon">{copied ? "Copied" : "Copy"}</button>
    </div>
  );
}

function Connect() {
  const [url, setUrl] = useState("");
  useEffect(() => setUrl(new URL("/mcp", window.location.origin).toString()), []);
  const claudeLink = url ? `https://claude.ai/customize/connectors?modal=add-custom-connector&connectorName=${encodeURIComponent("NanoDrift")}&connectorUrl=${encodeURIComponent(url)}` : "https://claude.ai/customize/connectors";
  const cc = `claude mcp add --scope user --transport http nanodrift '${url.replace(/'/g, "'\\''")}'`;

  return (
    <>
      <PageHero eyebrow="NanoDrift Connector" title="Connect your AI." intro="Give Claude, ChatGPT or any AI assistant that supports custom connectors direct access to NanoDrift." />
      <Section>
        <div className="holo-panel holo-scan p-6 md:p-8">
          <div className="relative z-[2]">
            <div className="eyebrow">Connector URL</div>
            <div className="mt-3"><CopyBox value={url} /></div>
            <p className="mt-4 text-sm text-muted-foreground">Your assistant can look up adapters, pricing, features and safety rules, check vehicle coverage, explain trouble codes and add you to the waitlist. No login needed.</p>
          </div>
        </div>
        <AgentBubble className="mt-8 max-w-2xl">Heads up: live vehicle diagnostics through the connector arrive once the NanoDrift device ships. Until then, I answer from NanoDrift's published info.</AgentBubble>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="holo-panel p-6">
            <h2 className="text-xl font-bold text-primary-glow">Claude</h2>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-secondary-foreground">
              <li><a href={claudeLink} target="_blank" rel="noreferrer" className="text-primary-glow underline">Open Claude's add-connector dialog</a> — the name and URL are filled in.</li>
              <li>Review the details and click <b>Add</b>.</li>
              <li>If it doesn't open, go to Settings → Connectors → <b>Add custom connector</b>, name it NanoDrift and paste the URL.</li>
              <li>Turn the connector on from the chat box, then ask Claude about NanoDrift.</li>
            </ol>
          </div>
          <div className="holo-panel p-6">
            <h2 className="text-xl font-bold text-primary-glow">ChatGPT</h2>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-secondary-foreground">
              <li>Open <a href="https://chatgpt.com/#settings/Connectors/Advanced" target="_blank" rel="noreferrer" className="text-primary-glow underline">ChatGPT's Apps settings</a> and turn on Developer mode.</li>
              <li><a href="https://chatgpt.com/plugins#settings/Connectors?create-connector=true&redirectAfter=%2Fplugins" target="_blank" rel="noreferrer" className="text-primary-glow underline">Open the new app dialog</a>, name it NanoDrift and paste the URL.</li>
              <li>Tick "I understand and want to continue" (ChatGPT shows this for every custom connector), then click <b>Create</b>.</li>
              <li>Turn the app on from the chat box and ask about NanoDrift.</li>
            </ol>
          </div>
          <div className="holo-panel p-6">
            <h2 className="text-xl font-bold text-primary-glow">Claude Code</h2>
            <p className="mt-3 text-sm text-secondary-foreground">Run this in a terminal, then type <code>/mcp</code> in Claude Code to confirm:</p>
            <div className="mt-3"><CopyBox value={url ? cc : ""} /></div>
          </div>
          <div className="holo-panel p-6">
            <h2 className="text-xl font-bold text-primary-glow">Gemini & other assistants</h2>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-secondary-foreground">
              <li>Open the assistant's connector or MCP server settings.</li>
              <li>Add a remote server, name it NanoDrift and paste the URL.</li>
              <li>Turn it on and ask about NanoDrift.</li>
            </ol>
          </div>
        </div>

        <div className="holo-panel mt-6 p-6">
          <h2 className="eyebrow">Getting new tools later</h2>
          <p className="mt-3 text-sm text-secondary-foreground">Assistants remember the tool list. When NanoDrift adds tools: in ChatGPT, open Plugins → NanoDrift → <b>Refresh</b>. In Claude, open Connectors → NanoDrift and refresh. In Claude Code, start a new session. If the URL ever changes, remove the connector and add it again.</p>
        </div>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link to="/pre-diagnose" className="btn-neon">Try Pre-Diagnose</Link>
          <Link to="/waitlist" className="btn-outline-neon">Join the waitlist</Link>
        </div>
      </Section>
    </>
  );
}

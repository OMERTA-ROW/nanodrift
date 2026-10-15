import { useState } from "react";
import { buildMemory } from "@/lib/vehicle-memory";
import type { Log } from "@/lib/vehicle-health";

const confCls = { none: "border-muted text-muted-foreground", low: "border-gold text-gold", medium: "border-primary/60 text-primary-glow", high: "border-primary text-primary-glow" } as const;

/** Prototype longitudinal memory + plain-language "voice". Read-only; never controls the vehicle. */
export function NanoMemory({ logs, sample }: { logs: Log[]; sample: boolean }) {
  const m = buildMemory(logs);
  const [speaking, setSpeaking] = useState(false);
  const canSpeak = typeof window !== "undefined" && "speechSynthesis" in window;
  const speak = () => {
    if (!canSpeak) return;
    window.speechSynthesis.cancel();
    if (speaking) { setSpeaking(false); return; }
    const u = new SpeechSynthesisUtterance(m.observations.join(" "));
    u.onend = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(u);
  };
  return (
    <div className="rounded-md border border-primary/30 p-4 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="eyebrow">Nano vehicle memory</h3>
        <span className="rounded-full border border-gold px-2 py-0.5 text-[10px] uppercase tracking-widest text-gold">Prototype</span>
      </div>
      <p className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">{sample ? "Sample history · not your vehicle" : `From ${m.scans} stored scan${m.scans === 1 ? "" : "s"}`}</p>
      <ul className="mt-3 space-y-1.5">{m.observations.map((o) => <li key={o} className="text-secondary-foreground">“{o}”</li>)}</ul>
      {m.trends.length > 0 && (
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {m.trends.map((t) => (
            <li key={t.key} className="rounded border border-primary/20 p-2 text-xs">
              <div className="flex items-center justify-between gap-2"><span className="font-bold">{t.label}</span><span className={`rounded-full border px-1.5 text-[10px] uppercase ${confCls[t.confidence]}`}>{t.confidence} confidence</span></div>
              <div className="text-muted-foreground">{t.first} → {t.last} {t.unit} · {t.direction} · {t.samples} readings</div>
            </li>
          ))}
        </ul>
      )}
      {canSpeak && <button type="button" onClick={speak} className="btn-outline-neon mt-3 !px-3 !py-1.5 text-xs">{speaking ? "Stop" : "Read aloud"}</button>}
      <p className="mt-3 text-[10px] text-muted-foreground">Simple comparisons of stored scans, written in a friendly voice. It is not conscious, does not learn on its own, is not connected to live hardware, and cannot change any vehicle settings. Confidence reflects how many readings exist, not accuracy.</p>
    </div>
  );
}

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Section, seo } from "@/components/Section";
import { AgentBubble, AgentHelmet } from "@/components/brand/Agent";
import { supabase } from "@/integrations/supabase/client";

type Search = { mode?: "login" | "signup" | undefined; redirect?: string | undefined };

export const Route = createFileRoute("/auth")({
  staticData: { sitemap: false },
  validateSearch: (s: Record<string, unknown>): Search => ({
    mode: s["mode"] === "signup" ? "signup" : s["mode"] === "login" ? "login" : undefined,
    redirect: typeof s["redirect"] === "string" && s["redirect"].startsWith("/") && !s["redirect"].startsWith("//") ? s["redirect"] : undefined,
  }),
  head: () => seo("Log in or sign up — NanoDrift", "Create your NanoDrift account to manage your garage, plan and agreements."),
  component: AuthPage,
});

const field = "w-full rounded-md border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:shadow-[var(--glow-sm)]";

function AuthPage() {
  const { mode = "login", redirect } = Route.useSearch();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "error" | "info"; text: string } | null>(null);
  const signup = mode === "signup";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email")).trim();
    const password = String(f.get("password"));
    setBusy(true); setMsg(null);
    if (signup) {
      const display_name = String(f.get("name") || "").trim().slice(0, 100);
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { display_name }, emailRedirectTo: window.location.origin + (redirect ?? "/garage") } });
      setBusy(false);
      if (error) return setMsg({ kind: "error", text: error.message });
      if (!data.session) return setMsg({ kind: "info", text: "Check your email to confirm your account, then log in." });
      navigate({ to: redirect ?? "/garage" });
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) return setMsg({ kind: "error", text: error.message });
      navigate({ to: redirect ?? "/garage" });
    }
  }

  return (
    <Section>
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <div className="eyebrow">{signup ? "Create account" : "Welcome back"}</div>
          <h1 className="mt-3 text-4xl font-black text-glow md:text-5xl">{signup ? "Sign up." : "Log in."}</h1>
          <p className="mt-4 text-muted-foreground">Your garage, plan and signed agreements in one place.</p>
          <AgentHelmet className="animate-float mt-8 hidden h-56 w-56 lg:block" />
        </div>
        <div className="holo-panel holo-scan p-6 md:p-8">
          <form onSubmit={onSubmit} className="relative z-[2] space-y-4">
            {signup && <input name="name" placeholder="Name" maxLength={100} className={field} />}
            <input name="email" type="email" required placeholder="Email" maxLength={255} className={field} autoComplete="email" />
            <input name="password" type="password" required minLength={8} placeholder="Password (8+ characters)" className={field} autoComplete={signup ? "new-password" : "current-password"} />
            {msg && <AgentBubble>{msg.text}</AgentBubble>}
            <button type="submit" disabled={busy} className="btn-neon w-full">{busy ? "Working…" : signup ? "Create account" : "Log in"}</button>
            <p className="text-center text-sm text-muted-foreground">
              {signup ? "Already have an account? " : "New to NanoDrift? "}
              <Link to="/auth" search={{ mode: signup ? "login" : "signup", redirect }} className="text-primary-glow hover:text-glow">{signup ? "Log in" : "Sign up"}</Link>
            </p>
          </form>
        </div>
      </div>
    </Section>
  );
}

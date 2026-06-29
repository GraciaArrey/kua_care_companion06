import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { ArrowLeft, Scale } from "lucide-react";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions - KUA" },
      { name: "description", content: "The agreement between you and KUA - written in plain words." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <AppShell title="Terms & Conditions" subtitle="Plain language. Last updated May 2026.">
      <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back home
      </Link>

      <div className="rounded-3xl border border-border/60 bg-card p-7 shadow-soft md:p-10">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
          <Scale className="h-3.5 w-3.5" /> Fair, calm and clear
        </div>

        <Section title="What KUA is">
          <p>KUA is a calm digital companion for caregivers and children. It offers educational tools, communication aids, screening checklists and gentle daily routines.</p>
        </Section>
        <Section title="What KUA is not">
          <p>KUA is not a medical device, not a substitute for a clinician, and the screening tests do not diagnose any condition. Always consult a qualified professional for clinical questions.</p>
        </Section>
        <Section title="Your account">
          <p>You agree to provide accurate information at signup, keep your password secret, and use the app for personal and caregiving purposes only. One person per account.</p>
        </Section>
        <Section title="Acceptable use">
          <ul className="list-disc pl-5 space-y-1">
            <li>No harmful, hateful or illegal content.</li>
            <li>No attempts to scrape, reverse-engineer or break the service.</li>
            <li>Be kind in any community spaces - these are spaces for tired families.</li>
          </ul>
        </Section>
        <Section title="Content you create">
          <p>Notes, mood entries, places and test results belong to you. We need a license to store and display them inside your account so the app works.</p>
        </Section>
        <Section title="Changes">
          <p>We may improve KUA over time. If something material changes in these terms, we'll let you know inside the app.</p>
        </Section>
        <Section title="Liability">
          <p>KUA is provided "as is". We do our best to keep it gentle and reliable, but we cannot accept liability for clinical decisions made from the content.</p>
        </Section>
        <Section title="Contact">
          <p>Questions? Reach us at <a href="mailto:hello@kua.app" className="text-primary underline">hello@kua.app</a>.</p>
        </Section>
      </div>
    </AppShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6 first:mt-0">
      <h2 className="font-display text-lg font-bold">{title}</h2>
      <div className="mt-2 text-sm leading-relaxed text-foreground/85">{children}</div>
    </section>
  );
}

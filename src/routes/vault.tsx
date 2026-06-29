import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, NotebookPen, Trash2, Sparkles, Pencil, Check, X } from "lucide-react";
import { AppShell } from "@/components/AppShell";

type Note = { id: string; text: string; at: number };
const KEY = "kua_vault_notes";

export const Route = createFileRoute("/vault")({
  head: () => ({ meta: [{ title: "Notes vault - KUA" }, { name: "description", content: "Private notes saved on this device." }] }),
  component: VaultPage,
});

function VaultPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    try { setNotes(JSON.parse(localStorage.getItem(KEY) || "[]")); } catch {}
  }, []);

  const persist = (next: Note[]) => {
    setNotes(next);
    if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(next));
  };

  const add = () => {
    if (!text.trim()) return;
    persist([{ id: crypto.randomUUID(), text: text.trim(), at: Date.now() }, ...notes]);
    setText("");
  };

  const startEdit = (n: Note) => { setEditingId(n.id); setEditText(n.text); };
  const cancelEdit = () => { setEditingId(null); setEditText(""); };
  const saveEdit = () => {
    if (!editingId) return;
    persist(notes.map((n) => n.id === editingId ? { ...n, text: editText.trim() || n.text, at: Date.now() } : n));
    cancelEdit();
  };

  return (
    <AppShell title="Notes vault" subtitle="Private notes, only on this device. Yours, gently.">
      <Link to="/caregiver" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Caregiver
      </Link>

      <section className="rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
        <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          <NotebookPen className="h-3.5 w-3.5" /> New note
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="A small thing worth remembering…"
          rows={4}
          className="mt-3 w-full resize-none rounded-2xl border border-border bg-background p-4 text-sm outline-none focus:border-primary"
        />
        <div className="mt-3 flex justify-end">
          <button onClick={add} disabled={!text.trim()} className="rounded-full bg-gradient-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-40">
            Save note
          </button>
        </div>
      </section>

      <section className="mt-6 space-y-3">
        {notes.length === 0 && (
          <div className="flex items-center gap-2 rounded-2xl border border-dashed border-border bg-card/60 p-5 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-secondary" /> No notes yet. The vault is yours when you're ready.
          </div>
        )}
        {notes.map((n) => {
          const isEditing = editingId === n.id;
          return (
            <article key={n.id} className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-soft">
              <div className="min-w-0 flex-1">
                {isEditing ? (
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={4}
                    className="w-full resize-none rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-primary"
                    autoFocus
                  />
                ) : (
                  <p className="whitespace-pre-wrap text-sm">{n.text}</p>
                )}
                <div className="mt-2 text-[11px] text-muted-foreground">{new Date(n.at).toLocaleString()}</div>
              </div>
              <div className="flex shrink-0 flex-col gap-1">
                {isEditing ? (
                  <>
                    <button onClick={saveEdit} className="rounded-full p-2 text-primary hover:bg-primary-soft" aria-label="Save">
                      <Check className="h-4 w-4" />
                    </button>
                    <button onClick={cancelEdit} className="rounded-full p-2 text-muted-foreground hover:bg-muted" aria-label="Cancel">
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEdit(n)} className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-primary" aria-label="Edit note">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => persist(notes.filter((x) => x.id !== n.id))} className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-tertiary" aria-label="Delete note">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </article>
          );
        })}
      </section>
    </AppShell>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, NotebookPen, Trash2, Sparkles, Pencil, Check, X, Cloud, HardDrive, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

type Note = { id: string; text: string; at: number };
const KEY = "kua_vault_notes";

export const Route = createFileRoute("/vault")({
  head: () => ({ meta: [{ title: "Notes vault - KUA" }, { name: "description", content: "Private caregiver notes." }] }),
  component: VaultPage,
});

function VaultPage() {
  const { user } = useAuth();
  const synced = !!user; // signed in → notes live in Supabase and sync across devices
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  // Load: Supabase when signed in, else localStorage.
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (synced) {
        setLoading(true);
        const { data, error } = await supabase
          .from("caregiver_notes")
          .select("id, body, updated_at")
          .order("updated_at", { ascending: false });
        if (cancelled) return;
        setLoading(false);
        if (error) { toast.error("Couldn't load notes", { description: error.message }); return; }
        setNotes((data ?? []).map((r) => ({ id: r.id, text: r.body, at: new Date(r.updated_at).getTime() })));
      } else if (typeof window !== "undefined") {
        try { setNotes(JSON.parse(localStorage.getItem(KEY) || "[]")); } catch { /* ignore */ }
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [synced]);

  const persistLocal = (next: Note[]) => {
    setNotes(next);
    if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(next));
  };

  const add = async () => {
    const body = text.trim();
    if (!body) return;
    if (synced && user) {
      const { data, error } = await supabase
        .from("caregiver_notes")
        .insert({ user_id: user.id, body })
        .select("id, body, updated_at")
        .single();
      if (error) return toast.error("Save failed", { description: error.message });
      setNotes((prev) => [{ id: data.id, text: data.body, at: new Date(data.updated_at).getTime() }, ...prev]);
    } else {
      persistLocal([{ id: crypto.randomUUID(), text: body, at: Date.now() }, ...notes]);
    }
    setText("");
  };

  const startEdit = (n: Note) => { setEditingId(n.id); setEditText(n.text); };
  const cancelEdit = () => { setEditingId(null); setEditText(""); };
  const saveEdit = async () => {
    if (!editingId) return;
    const body = editText.trim();
    if (!body) return cancelEdit();
    if (synced) {
      const { error } = await supabase.from("caregiver_notes").update({ body }).eq("id", editingId);
      if (error) return toast.error("Save failed", { description: error.message });
      setNotes((arr) => arr.map((n) => (n.id === editingId ? { ...n, text: body, at: Date.now() } : n)));
    } else {
      persistLocal(notes.map((n) => (n.id === editingId ? { ...n, text: body, at: Date.now() } : n)));
    }
    cancelEdit();
  };

  const remove = async (id: string) => {
    if (synced) {
      const { error } = await supabase.from("caregiver_notes").delete().eq("id", id);
      if (error) return toast.error("Delete failed", { description: error.message });
      setNotes((arr) => arr.filter((n) => n.id !== id));
    } else {
      persistLocal(notes.filter((n) => n.id !== id));
    }
  };

  return (
    <AppShell title="Caregiver's notes" subtitle="A quiet place for the things worth remembering.">
      <Link to="/caregiver" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Caregiver
      </Link>

      <section className="rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            <NotebookPen className="h-3.5 w-3.5" /> New note
          </label>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-[11px] font-medium text-muted-foreground">
            {synced ? <Cloud className="h-3 w-3" /> : <HardDrive className="h-3 w-3" />}
            {synced ? "Synced to your account" : "Saved on this device"}
          </span>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="A small thing worth remembering…"
          rows={4}
          className="mt-3 w-full resize-none rounded-2xl border border-border bg-background p-4 text-sm outline-none focus:border-primary"
        />
        <div className="mt-3 flex justify-end">
          <button onClick={() => void add()} disabled={!text.trim()} className="rounded-full bg-gradient-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-40">
            Save note
          </button>
        </div>
      </section>

      <section className="mt-6">
        {loading ? (
          <div className="flex items-center gap-2 rounded-2xl border border-dashed border-border bg-card/60 p-5 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading your notes…
          </div>
        ) : notes.length === 0 ? (
          <div className="flex items-center gap-2 rounded-2xl border border-dashed border-border bg-card/60 p-5 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-secondary" /> No notes yet. The vault is yours when you're ready.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {notes.map((n) => {
              const isEditing = editingId === n.id;
              return (
                <article key={n.id} className="flex flex-col rounded-2xl border border-border/60 bg-card p-4 shadow-soft">
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
                      <p className="whitespace-pre-wrap break-words text-sm">{n.text}</p>
                    )}
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/50 pt-2">
                    <span className="text-[11px] text-muted-foreground">{new Date(n.at).toLocaleString()}</span>
                    <div className="flex shrink-0 items-center gap-1">
                      {isEditing ? (
                        <>
                          <button onClick={() => void saveEdit()} className="rounded-full p-2 text-primary hover:bg-primary-soft" aria-label="Save">
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
                          <button onClick={() => void remove(n.id)} className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-tertiary" aria-label="Delete note">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </AppShell>
  );
}

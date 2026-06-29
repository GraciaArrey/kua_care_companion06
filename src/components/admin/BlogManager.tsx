import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Trash2, Pencil, Search, X, Eye, EyeOff, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

type Row = {
  id: string;
  slug: string;
  title_en: string;
  title_fr: string | null;
  category: string;
  read_minutes: number;
  excerpt_en: string;
  excerpt_fr: string | null;
  body_en: string[];
  body_fr: string[];
  published: boolean;
  created_at: string;
  updated_at: string;
};

const EMPTY: Omit<Row, "id" | "created_at" | "updated_at"> = {
  slug: "",
  title_en: "",
  title_fr: "",
  category: "Featured",
  read_minutes: 5,
  excerpt_en: "",
  excerpt_fr: "",
  body_en: [],
  body_fr: [],
  published: true,
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

export function BlogManager({ onAudit }: { onAudit?: (action: string, detail?: Record<string, unknown>) => void }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Row | null>(null);
  const [creating, setCreating] = useState(false);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("blog_posts").select("*").order("updated_at", { ascending: false });
    if (error) toast.error("Couldn't load posts", { description: error.message });
    setRows((data ?? []) as Row[]);
    setLoading(false);
  }
  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    if (!ql) return rows;
    return rows.filter((r) => [r.title_en, r.title_fr ?? "", r.category, r.slug].join(" ").toLowerCase().includes(ql));
  }, [rows, q]);

  async function togglePublish(r: Row) {
    const next = !r.published;
    const { error } = await supabase.from("blog_posts").update({ published: next }).eq("id", r.id);
    if (error) return toast.error("Update failed", { description: error.message });
    onAudit?.(next ? "blog.publish" : "blog.unpublish", { id: r.id, slug: r.slug });
    void load();
  }
  async function remove(r: Row) {
    if (!confirm(`Delete "${r.title_en}"?`)) return;
    const { error } = await supabase.from("blog_posts").delete().eq("id", r.id);
    if (error) return toast.error("Delete failed", { description: error.message });
    onAudit?.("blog.delete", { id: r.id, slug: r.slug });
    setRows((x) => x.filter((y) => y.id !== r.id));
    toast.success("Deleted.");
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search title, category, slug…"
              className="w-full rounded-full border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <button
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4" /> New post
          </button>
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          Published posts appear at <code className="rounded bg-muted px-1">/article/&lt;slug&gt;</code>. Static built-in articles continue to work alongside DB posts.
        </p>
      </div>

      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        {loading && rows.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" /> Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">No posts yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3">Title</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-t border-border align-top">
                  <td className="px-5 py-3">
                    <div className="font-medium text-foreground">{r.title_en}</div>
                    <div className="text-[11px] text-muted-foreground">/article/{r.slug}</div>
                  </td>
                  <td className="px-5 py-3 text-xs">{r.category}</td>
                  <td className="px-5 py-3 text-xs">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${r.published ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                      {r.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex flex-wrap items-center justify-end gap-1">
                      <Link
                        to="/article/$slug"
                        params={{ slug: r.slug }}
                        className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground hover:bg-muted"
                        aria-label="Open"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                      <button
                        onClick={() => togglePublish(r)}
                        className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground hover:bg-muted"
                        aria-label={r.published ? "Unpublish" : "Publish"}
                      >
                        {r.published ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                      <button onClick={() => setEditing(r)} className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground hover:bg-muted">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => remove(r)}
                        className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {(editing || creating) && (
        <BlogEditor
          initial={editing ?? EMPTY}
          isNew={creating}
          onClose={() => {
            setEditing(null);
            setCreating(false);
          }}
          onSaved={(action, detail) => {
            onAudit?.(action, detail);
            setEditing(null);
            setCreating(false);
            void load();
          }}
        />
      )}
    </div>
  );
}

function BlogEditor({
  initial,
  isNew,
  onClose,
  onSaved,
}: {
  initial: Row | Omit<Row, "id" | "created_at" | "updated_at">;
  isNew: boolean;
  onClose: () => void;
  onSaved: (action: string, detail: Record<string, unknown>) => void;
}) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    const slug = (form.slug || slugify(form.title_en)).trim();
    if (!slug || !form.title_en.trim()) return toast.error("Title and slug required.");
    setSaving(true);
    const payload = {
      slug,
      title_en: form.title_en.trim(),
      title_fr: form.title_fr || null,
      category: form.category || "Featured",
      read_minutes: Number(form.read_minutes) || 5,
      excerpt_en: form.excerpt_en,
      excerpt_fr: form.excerpt_fr || null,
      body_en: form.body_en,
      body_fr: form.body_fr,
      published: form.published,
    };
    if (isNew) {
      const { data, error } = await supabase.from("blog_posts").insert(payload).select("id").single();
      setSaving(false);
      if (error) return toast.error("Create failed", { description: error.message });
      onSaved("blog.create", { id: data?.id, slug });
      toast.success("Post created.");
    } else {
      const id = (initial as Row).id;
      const { error } = await supabase.from("blog_posts").update(payload).eq("id", id);
      setSaving(false);
      if (error) return toast.error("Save failed", { description: error.message });
      onSaved("blog.update", { id, slug });
      toast.success("Saved.");
    }
  }

  return (
    <div className="fixed inset-0 z-[1100] grid place-items-center bg-foreground/40 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-card">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold">{isNew ? "New blog post" : "Edit blog post"}</h3>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-muted hover:bg-muted/70">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field label="Title (EN) *" className="sm:col-span-2">
            <input
              value={form.title_en}
              onChange={(e) => {
                set("title_en", e.target.value);
                if (isNew && !form.slug) set("slug", slugify(e.target.value));
              }}
              className={inputCls}
            />
          </Field>
          <Field label="Title (FR)" className="sm:col-span-2">
            <input value={form.title_fr ?? ""} onChange={(e) => set("title_fr", e.target.value)} className={inputCls} />
          </Field>
          <Field label="Slug *">
            <input value={form.slug} onChange={(e) => set("slug", slugify(e.target.value))} className={inputCls} />
          </Field>
          <Field label="Category">
            <input
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              list="kua-blog-categories"
              className={inputCls}
            />
            <datalist id="kua-blog-categories">
              <option value="Featured" />
              <option value="Speech & communication" />
              <option value="Emotional regulation" />
              <option value="Sensory & sleep" />
              <option value="Recipes & routines" />
              <option value="School & learning" />
              <option value="Caregiver wellbeing" />
              <option value="Resources" />
            </datalist>
          </Field>
          <Field label="Read minutes">
            <input
              type="number"
              min={1}
              value={form.read_minutes}
              onChange={(e) => set("read_minutes", Number(e.target.value))}
              className={inputCls}
            />
          </Field>
          <Field label="Published">
            <select value={String(form.published)} onChange={(e) => set("published", e.target.value === "true")} className={inputCls}>
              <option value="true">Published</option>
              <option value="false">Draft</option>
            </select>
          </Field>
          <Field label="Excerpt (EN)" className="sm:col-span-2">
            <textarea rows={2} value={form.excerpt_en} onChange={(e) => set("excerpt_en", e.target.value)} className={inputCls} />
          </Field>
          <Field label="Excerpt (FR)" className="sm:col-span-2">
            <textarea rows={2} value={form.excerpt_fr ?? ""} onChange={(e) => set("excerpt_fr", e.target.value)} className={inputCls} />
          </Field>
          <Field label="Body (EN) — one paragraph per line" className="sm:col-span-2">
            <textarea
              rows={8}
              value={form.body_en.join("\n\n")}
              onChange={(e) => set("body_en", e.target.value.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean))}
              className={inputCls}
            />
          </Field>
          <Field label="Body (FR) — one paragraph per line" className="sm:col-span-2">
            <textarea
              rows={8}
              value={form.body_fr.join("\n\n")}
              onChange={(e) => set("body_fr", e.target.value.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean))}
              className={inputCls}
            />
          </Field>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-full border border-border px-4 py-2 text-sm hover:bg-muted">
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-sm disabled:opacity-50"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {isNew ? "Create" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/20";

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

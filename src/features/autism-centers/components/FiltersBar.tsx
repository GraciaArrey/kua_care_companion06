import { Search } from "lucide-react";
import { CATEGORY_LABELS, CENTER_CATEGORIES, type CenterFilters } from "../types";

type Props = {
  filters: CenterFilters;
  onChange: (next: CenterFilters) => void;
  lang?: "en" | "fr";
  resultCount: number;
};

export function FiltersBar({ filters, onChange, lang = "en", resultCount }: Props) {
  const t = (en: string, fr: string) => (lang === "fr" ? fr : en);

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 rounded-2xl border border-border/60 bg-card px-4 py-2.5 shadow-soft focus-within:ring-2 focus-within:ring-primary/40">
        <Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <input
          type="search"
          value={filters.query}
          onChange={(e) => onChange({ ...filters, query: e.target.value })}
          placeholder={t("Search by name, city, region or service…", "Rechercher par nom, ville, région ou service…")}
          className="min-h-[40px] flex-1 bg-transparent text-sm outline-none"
          aria-label={t("Search verified centers", "Rechercher des centres vérifiés")}
        />
      </label>

      <div role="group" aria-label={t("Filter by category", "Filtrer par catégorie")} className="flex flex-wrap gap-2">
        <CategoryChip
          active={filters.category === "all"}
          onClick={() => onChange({ ...filters, category: "all" })}
          label={t("All", "Tout")}
        />
        {CENTER_CATEGORIES.map((cat) => (
          <CategoryChip
            key={cat}
            active={filters.category === cat}
            onClick={() => onChange({ ...filters, category: cat })}
            label={CATEGORY_LABELS[cat][lang]}
          />
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        {resultCount === 1
          ? t("1 verified center", "1 centre vérifié")
          : t(`${resultCount} verified centers`, `${resultCount} centres vérifiés`)}
      </p>
    </div>
  );
}

function CategoryChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`min-h-[40px] rounded-full px-4 py-2 text-xs font-semibold transition ${
        active
          ? "bg-foreground text-background"
          : "bg-muted text-foreground hover:bg-muted/70"
      }`}
    >
      {label}
    </button>
  );
}

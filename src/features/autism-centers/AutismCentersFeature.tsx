import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Crosshair, Loader2, MapPin, RotateCw } from "lucide-react";
import { autismCentersQueryOptions } from "./queries";
import {
  CAMEROON_CENTER,
  distanceKm,
  type AutismCenter,
  type CenterFilters,
} from "./types";
import { FiltersBar } from "./components/FiltersBar";
import { CenterListItem } from "./components/CenterListItem";
import { CenterDetailPanel } from "./components/CenterDetailPanel";

// Lazy-load map so Leaflet only ships when the feature mounts.
const MapView = lazy(() => import("./components/MapView"));

export type AutismCentersFeatureProps = {
  lang?: "en" | "fr";
  theme?: "light" | "dark";
  /** Height of the map area. Defaults to a comfortable mobile/desktop height. */
  mapHeightClassName?: string;
  className?: string;
};

/**
 * Self-contained, mountable autism support map feature.
 * - Data layer: queries.ts (Supabase, RLS-restricted to verified centers)
 * - Map layer: components/MapView.tsx (Leaflet + clustering)
 * - UI layer: FiltersBar, CenterListItem, CenterDetailPanel
 */
export function AutismCentersFeature({
  lang = "en",
  theme = "light",
  mapHeightClassName = "h-[480px] md:h-[600px]",
  className,
}: AutismCentersFeatureProps) {
  const t = (en: string, fr: string) => (lang === "fr" ? fr : en);

  const [mounted, setMounted] = useState(false);
  const [filters, setFilters] = useState<CenterFilters>({ query: "", category: "all" });
  const [selected, setSelected] = useState<AutismCenter | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  useEffect(() => setMounted(true), []);

  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery(autismCentersQueryOptions());

  const filtered = useMemo(() => {
    const all = data ?? [];
    const q = filters.query.trim().toLowerCase();
    return all.filter((c) => {
      if (filters.category !== "all" && c.category !== filters.category) return false;
      if (!q) return true;
      const hay = [
        c.name,
        c.city ?? "",
        c.region ?? "",
        c.address ?? "",
        c.description ?? "",
        ...(c.services_offered ?? []),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [data, filters]);

  const sorted = useMemo(() => {
    if (!userLocation) return filtered;
    return [...filtered].sort(
      (a, b) =>
        distanceKm(userLocation, [a.latitude, a.longitude]) -
        distanceKm(userLocation, [b.latitude, b.longitude]),
    );
  }, [filtered, userLocation]);

  const requestLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
      () => {},
      { enableHighAccuracy: false, timeout: 6000 },
    );
  };

  if (isError) {
    return (
      <div className={`rounded-3xl border border-destructive/30 bg-destructive/5 p-6 text-sm ${className ?? ""}`} role="alert">
        <div className="flex items-center gap-2 font-semibold text-destructive">
          <AlertCircle className="h-4 w-4" /> {t("Could not load support centers", "Impossible de charger les centres")}
        </div>
        <p className="mt-2 text-muted-foreground">{(error as Error)?.message ?? ""}</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-full bg-foreground px-4 py-2 text-xs font-semibold text-background"
        >
          <RotateCw className="h-3.5 w-3.5" /> {t("Retry", "Réessayer")}
        </button>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden rounded-3xl border border-border/60 bg-card shadow-soft ${className ?? ""}`}>
      <div className="border-b border-border/60 p-4 md:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <FiltersBar filters={filters} onChange={setFilters} lang={lang} resultCount={sorted.length} />
          </div>
          <button
            type="button"
            onClick={requestLocation}
            className="hidden min-h-[44px] shrink-0 items-center gap-1.5 self-start rounded-full bg-muted px-3 py-2 text-xs font-semibold hover:bg-muted/70 md:inline-flex"
            aria-label={t("Use my location", "Utiliser ma position")}
          >
            <Crosshair className="h-3.5 w-3.5" /> {t("My location", "Ma position")}
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-[minmax(0,340px)_1fr]">
        <div className={`order-2 max-h-[420px] divide-y divide-border/60 overflow-y-auto md:order-1 md:max-h-none ${mapHeightClassName.replace("h-", "md:h-")}`}>
          {isLoading && (
            <div className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> {t("Loading verified centers…", "Chargement des centres vérifiés…")}
            </div>
          )}
          {!isLoading && sorted.length === 0 && (
            <EmptyState lang={lang} hasFilters={filters.query !== "" || filters.category !== "all"} onReset={() => setFilters({ query: "", category: "all" })} />
          )}
          {sorted.map((c) => (
            <CenterListItem
              key={c.id}
              center={c}
              active={selected?.id === c.id}
              onClick={() => setSelected(c)}
              lang={lang}
              userLocation={userLocation}
            />
          ))}
        </div>

        <div className={`relative order-1 bg-muted/30 md:order-2 ${mapHeightClassName}`}>
          {mounted ? (
            <Suspense
              fallback={
                <div className="grid h-full place-items-center text-sm text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              }
            >
              <MapView
                centers={sorted}
                selectedId={selected?.id ?? null}
                onSelect={setSelected}
                theme={theme}
                userLocation={userLocation}
              />
            </Suspense>
          ) : (
            <div className="grid h-full place-items-center text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          )}
          {isRefetching && (
            <div className="pointer-events-none absolute right-3 top-3 rounded-full bg-card/90 px-3 py-1 text-[11px] font-medium text-muted-foreground shadow-soft">
              {t("Updating…", "Mise à jour…")}
            </div>
          )}
        </div>
      </div>

      <CenterDetailPanel center={selected} onClose={() => setSelected(null)} lang={lang} userLocation={userLocation} />
    </div>
  );
}

function EmptyState({ lang, hasFilters, onReset }: { lang: "en" | "fr"; hasFilters: boolean; onReset: () => void }) {
  const t = (en: string, fr: string) => (lang === "fr" ? fr : en);
  return (
    <div className="flex flex-col items-start gap-3 p-6 text-sm text-muted-foreground">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-muted">
        <MapPin className="h-4 w-4" />
      </span>
      <p>
        {hasFilters
          ? t("No verified centers match these filters.", "Aucun centre vérifié ne correspond à ces filtres.")
          : t("No verified centers yet. Once admins add and verify centers, they will appear here.", "Aucun centre vérifié pour le moment. Les centres apparaîtront ici après validation par un administrateur.")}
      </p>
      {hasFilters && (
        <button
          type="button"
          onClick={onReset}
          className="min-h-[40px] rounded-full bg-foreground px-4 py-2 text-xs font-semibold text-background"
        >
          {t("Clear filters", "Réinitialiser les filtres")}
        </button>
      )}
    </div>
  );
}

// Re-export center constant for consumers who want to align surrounding UI
export { CAMEROON_CENTER };

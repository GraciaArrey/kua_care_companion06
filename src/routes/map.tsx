import { createFileRoute, Link } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { ArrowLeft, MapPin, Sparkles, Search, Loader2, Plus, Crosshair, Trash2, Phone, Navigation } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { usePrefs } from "@/lib/prefs";
import { toast } from "sonner";
import type { MapPlace } from "@/components/LeafletMap";
import { CAMEROON_CENTER, isWithinCameroon, VERIFIED_SUPPORT_PLACES } from "@/lib/support-map-data";
import { AutismCentersFeature } from "@/features/autism-centers";

const LeafletMap = lazy(() => import("@/components/LeafletMap"));

export const Route = createFileRoute("/map")({
  head: () => ({ meta: [{ title: "Support map - KUA" }, { name: "description", content: "Find verified care, sensory-friendly schools and parent groups near you on a real interactive map." }] }),
  component: MapPage,
});

const filters = ["All", "Schools", "Parent groups", "Emergency", "Therapists", "Other"] as const;
type Filter = (typeof filters)[number];

const DEFAULT_CENTER: [number, number] = CAMEROON_CENTER;

const labelFor = (f: Filter, lang: "en" | "fr") => lang === "fr" ? ({
  All: "Tout",
  Schools: "Écoles",
  "Parent groups": "Groupes parents",
  Emergency: "Urgence",
  Therapists: "Centres d'appui",
  Other: "Autres",
} as Record<Filter, string>)[f] : f;

function distanceKm(a: [number, number], b: [number, number]) {
  const R = 6371;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLng = ((b[1] - a[1]) * Math.PI) / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos((a[0] * Math.PI) / 180) * Math.cos((b[0] * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function MapPage() {
  const { user } = useAuth();
  const { lang } = usePrefs();
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState<Filter>("All");
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [center, setCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [outsideCameroon, setOutsideCameroon] = useState(false);
  const [savedPlaces, setSavedPlaces] = useState<MapPlace[]>([]);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [pendingCoord, setPendingCoord] = useState<[number, number] | null>(null);

  useEffect(() => setMounted(true), []);


  // Geolocate
  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        if (!isWithinCameroon(c)) {
          setOutsideCameroon(true);
          return;
        }
        setOutsideCameroon(false);
        setUserLocation(c);
        setCenter(c);
      },
      () => {},
      { enableHighAccuracy: false, timeout: 6000 },
    );
  }, []);

  // Load user's saved places
  useEffect(() => {
    if (!user) return;
    supabase.from("places").select("*").order("created_at", { ascending: false }).then(({ data, error }) => {
      if (error) return;
      setSavedPlaces((data ?? []) as MapPlace[]);
    });
  }, [user]);

  const allPlaces = useMemo(() => outsideCameroon ? savedPlaces.filter((p) => isWithinCameroon([p.lat, p.lng])) : [...savedPlaces, ...VERIFIED_SUPPORT_PLACES], [savedPlaces, outsideCameroon]);
  const visible = useMemo(
    () => allPlaces.filter((p) => active === "All" || p.category === active),
    [allPlaces, active],
  );

  const visibleSorted = useMemo(() => {
    if (!userLocation) return visible;
    return [...visible].sort(
      (a, b) => distanceKm(userLocation, [a.lat, a.lng]) - distanceKm(userLocation, [b.lat, b.lng]),
    );
  }, [visible, userLocation]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=cm&q=${encodeURIComponent(query + ", Cameroon")}`,
        { headers: { Accept: "application/json" } },
      );
      const data = (await res.json()) as Array<{ lat: string; lon: string; display_name: string }>;
      if (!data[0]) {
        toast.error(lang === "fr" ? "Lieu introuvable" : "Location not found");
        return;
      }
      const c: [number, number] = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      if (!isWithinCameroon(c)) {
        toast.error(lang === "fr" ? "Choisissez un lieu au Cameroun" : "Choose a place inside Cameroon");
        return;
      }
      setOutsideCameroon(false);
      setCenter(c);
      toast.success(data[0].display_name.split(",").slice(0, 2).join(","));
    } catch {
      toast.error(lang === "fr" ? "Recherche échouée" : "Search failed");
    } finally {
      setSearching(false);
    }
  };

  const recenterMe = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        if (!isWithinCameroon(c)) {
          setOutsideCameroon(true);
          toast.error(lang === "fr" ? "Votre position semble hors du Cameroun" : "Your location appears outside Cameroon");
          return;
        }
        setOutsideCameroon(false);
        setUserLocation(c);
        setCenter(c);
      },
      () => toast.error(lang === "fr" ? "Impossible d'obtenir votre position" : "Could not get your location"),
    );
  };

  const handleMapClick = (lat: number, lng: number) => {
    if (!user) {
      toast.message(lang === "fr" ? "Connectez-vous pour enregistrer des lieux" : "Sign in to save places", { description: lang === "fr" ? "Vos lieux se synchronisent sur vos appareils." : "Your places sync across devices." });
      return;
    }
    if (!isWithinCameroon([lat, lng])) return toast.error(lang === "fr" ? "La carte d'aide est limitée au Cameroun." : "The support map is limited to Cameroon.");
    setPendingCoord([lat, lng]);
    setAddOpen(true);
  };

  const deletePlace = async (id: string) => {
    if (id.startsWith("verified-")) return;
    const { error } = await supabase.from("places").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setSavedPlaces((prev) => prev.filter((p) => p.id !== id));
    toast.success(lang === "fr" ? "Supprimé" : "Removed");
  };

  return (
    <AppShell title={lang === "fr" ? "Carte de soutien" : "Support map"} subtitle={lang === "fr" ? "Trouvez des aides vérifiées au Cameroun, avec sources et itinéraires." : "Find verified Cameroon support sites, with sources and directions."}>
      <Link to="/support" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> {lang === "fr" ? "Retour au centre de soutien" : "Back to Support Hub"}
      </Link>

      {outsideCameroon && (
        <div className="mb-4 rounded-2xl border border-secondary/50 bg-secondary/20 p-4 text-sm text-secondary-foreground">
          {lang === "fr" ? "Votre position semble hors du Cameroun. La carte affiche uniquement les ressources vérifiées situées au Cameroun." : "Your location appears outside Cameroon. This map only shows verified resources inside Cameroon."}
        </div>
      )}

      {/* Verified autism support centers — self-contained feature module */}
      <section className="mb-8">
        <header className="mb-3">
          <h2 className="font-display text-lg font-bold">
            {lang === "fr" ? "Centres vérifiés au Cameroun" : "Verified centers in Cameroon"}
          </h2>
          <p className="text-xs text-muted-foreground">
            {lang === "fr"
              ? "Écoles, thérapeutes, ONG et groupes de soutien validés par notre équipe."
              : "Schools, therapists, NGOs and support groups vetted by our team."}
          </p>
        </header>
        <AutismCentersFeature lang={lang} />
      </section>

      {/* Toolbar */}
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <form onSubmit={handleSearch} className="flex flex-1 items-center gap-2 rounded-full border border-border/60 bg-card px-4 py-2 shadow-soft">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={lang === "fr" ? "Ville, quartier, adresse…" : "Search city, neighbourhood, address…"}
            className="flex-1 bg-transparent text-sm outline-none"
          />
          <button type="submit" disabled={searching} className="rounded-full bg-foreground px-3 py-1 text-xs font-semibold text-background disabled:opacity-50">
            {searching ? <Loader2 className="h-3 w-3 animate-spin" /> : (lang === "fr" ? "OK" : "Go")}
          </button>
        </form>
        <div className="flex gap-2">
          <button onClick={recenterMe} className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-2 text-xs font-semibold hover:bg-muted/70">
            <Crosshair className="h-3.5 w-3.5" /> {lang === "fr" ? "Ma position" : "My location"}
          </button>
          <button
            onClick={() => {
              if (!user) return toast.message(lang === "fr" ? "Connectez-vous pour enregistrer des lieux" : "Sign in to save places");
              if (!isWithinCameroon(userLocation ?? center)) return toast.error(lang === "fr" ? "La carte d'aide est limitée au Cameroun." : "The support map is limited to Cameroon.");
              setPendingCoord(userLocation ?? center);
              setAddOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-full bg-gradient-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-glow"
          >
            <Plus className="h-3.5 w-3.5" /> {lang === "fr" ? "Ajouter" : "Add place"}
          </button>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActive(f)}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${active === f ? "bg-foreground text-background" : "bg-muted hover:bg-muted/70"}`}
          >
            {labelFor(f, lang)}
          </button>
        ))}
      </div>

      <section className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-soft">
        <div className="grid md:grid-cols-[1fr_1.4fr]">
          <div className="max-h-[520px] divide-y divide-border/60 overflow-auto">
            {visibleSorted.map((p) => (
              <button
                key={p.id}
                onClick={() => setFocusId(p.id)}
                className="flex w-full items-start gap-3 p-5 text-left transition hover:bg-muted/40"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                  <MapPin className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-display text-sm font-bold">{p.name}</h4>
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      {userLocation ? `${distanceKm(userLocation, [p.lat, p.lng]).toFixed(1)} km` : ""}
                    </span>
                  </div>
                  {(lang === "fr" ? (p.noteFr ?? p.note) : p.note) && <p className="mt-1 text-xs text-muted-foreground">{lang === "fr" ? (p.noteFr ?? p.note) : p.note}</p>}
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">{labelFor(p.category as Filter, lang)}</span>
                    {p.phone && (
                      <a href={`tel:${p.phone}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 text-[10px] font-semibold text-primary">
                        <Phone className="h-3 w-3" /> {p.phone}
                      </a>
                    )}
                    <a
                      href={`https://www.openstreetmap.org/directions?${userLocation ? `from=${userLocation[0]},${userLocation[1]}&` : ""}to=${p.lat},${p.lng}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 text-[10px] font-semibold text-primary"
                    >
                      <Navigation className="h-3 w-3" /> {lang === "fr" ? "Itinéraire" : "Directions"}
                    </a>
                    {p.sourceUrl && (
                      <a href={p.sourceUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-[10px] font-semibold text-primary">
                        {lang === "fr" ? (p.sourceLabelFr ?? "Source") : (p.sourceLabel ?? "Source")}
                      </a>
                    )}
                    {!p.id.startsWith("verified-") && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePlace(p.id);
                        }}
                        className="ml-auto text-muted-foreground hover:text-destructive"
                        aria-label="Remove"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              </button>
            ))}
            {visibleSorted.length === 0 && (
              <div className="p-6 text-sm text-muted-foreground">{lang === "fr" ? "Aucun lieu dans cette catégorie. Essayez un autre filtre ou ajoutez un lieu." : "Nothing in this category nearby. Try another filter or add a place."}</div>
            )}
          </div>
          <div className="relative h-[520px] bg-muted/30">
            {mounted ? (
              <Suspense fallback={<div className="grid h-full place-items-center text-sm text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /></div>}>
                <LeafletMap
                  center={center}
                  userLocation={userLocation}
                  places={visible}
                  onMapClick={handleMapClick}
                  focusId={focusId}
                />
              </Suspense>
            ) : (
              <div className="grid h-full place-items-center text-sm text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /></div>
            )}
          </div>
        </div>
      </section>

      <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
        <Sparkles className="h-3 w-3" /> {lang === "fr" ? "Les lieux vérifiés affichent leur source. Touchez la carte pour enregistrer un lieu personnel au Cameroun." : "Verified places show their source. Tap the map to save a personal place inside Cameroon."}
      </p>

      {addOpen && pendingCoord && (
        <AddPlaceDialog
          coord={pendingCoord}
          onClose={() => setAddOpen(false)}
          lang={lang}
          onSaved={(p) => {
            setSavedPlaces((prev) => [p, ...prev]);
            setAddOpen(false);
            setFocusId(p.id);
          }}
        />
      )}
    </AppShell>
  );
}

function AddPlaceDialog({
  coord,
  onClose,
  lang,
  onSaved,
}: {
  coord: [number, number];
  onClose: () => void;
  lang: "en" | "fr";
  onSaved: (p: MapPlace) => void;
}) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Filter>("Schools");
  const [note, setNote] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);

  // Reverse geocode
  useEffect(() => {
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coord[0]}&lon=${coord[1]}`)
      .then((r) => r.json())
      .then((d: { display_name?: string }) => d.display_name && setAddress(d.display_name))
      .catch(() => {});
  }, [coord]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name.trim() || category === "All") return;
    setSaving(true);
    const { data, error } = await supabase
      .from("places")
      .insert({
        user_id: user.id,
        name: name.trim(),
        category,
        note: note.trim() || null,
        phone: phone.trim() || null,
        address: address.trim() || null,
        lat: coord[0],
        lng: coord[1],
      })
      .select()
      .single();
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(lang === "fr" ? "Lieu enregistré" : "Place saved");
    onSaved(data as MapPlace);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4" onClick={onClose}>
      <form
        onSubmit={save}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md space-y-3 rounded-3xl border border-border/60 bg-card p-6 shadow-card"
      >
        <h3 className="font-display text-lg font-bold">{lang === "fr" ? "Enregistrer un lieu" : "Save a place"}</h3>
        <p className="text-xs text-muted-foreground">{coord[0].toFixed(4)}, {coord[1].toFixed(4)}</p>
        <input required value={name} onChange={(e) => setName(e.target.value)} placeholder={lang === "fr" ? "Nom" : "Name"} className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm outline-none" />
        <select value={category} onChange={(e) => setCategory(e.target.value as Filter)} className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm">
          {filters.filter((f) => f !== "All").map((f) => <option key={f} value={f}>{labelFor(f, lang)}</option>)}
        </select>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder={lang === "fr" ? "Note courte (optionnel)" : "Short note (optional)"} rows={2} className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm outline-none" />
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={lang === "fr" ? "Téléphone (optionnel)" : "Phone (optional)"} className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm outline-none" />
        <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder={lang === "fr" ? "Adresse" : "Address"} className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm outline-none" />
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-full bg-muted px-4 py-2 text-xs font-semibold">{lang === "fr" ? "Annuler" : "Cancel"}</button>
          <button disabled={saving} type="submit" className="rounded-full bg-gradient-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-glow disabled:opacity-50">
            {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : (lang === "fr" ? "Enregistrer" : "Save place")}
          </button>
        </div>
      </form>
    </div>
  );
}

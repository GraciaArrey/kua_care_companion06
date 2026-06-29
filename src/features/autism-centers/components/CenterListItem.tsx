import { MapPin } from "lucide-react";
import { CATEGORY_COLORS, CATEGORY_LABELS, distanceKm, type AutismCenter } from "../types";

type Props = {
  center: AutismCenter;
  active: boolean;
  onClick: () => void;
  lang?: "en" | "fr";
  userLocation?: [number, number] | null;
};

export function CenterListItem({ center, active, onClick, lang = "en", userLocation }: Props) {
  const distance = userLocation
    ? distanceKm(userLocation, [center.latitude, center.longitude])
    : null;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active}
      className={`flex w-full items-start gap-3 p-4 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
        active ? "bg-primary-soft/60" : "hover:bg-muted/40"
      }`}
    >
      <span
        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
        style={{ background: `${CATEGORY_COLORS[center.category]}22`, color: CATEGORY_COLORS[center.category] }}
        aria-hidden="true"
      >
        <MapPin className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-display text-sm font-bold leading-tight">{center.name}</h4>
          {distance !== null && (
            <span className="shrink-0 text-[11px] text-muted-foreground">{distance.toFixed(1)} km</span>
          )}
        </div>
        <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {CATEGORY_LABELS[center.category][lang]}
        </p>
        {(center.city || center.region) && (
          <p className="mt-1 text-xs text-muted-foreground">
            {[center.city, center.region].filter(Boolean).join(", ")}
          </p>
        )}
      </div>
    </button>
  );
}

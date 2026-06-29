import { X, Phone, Mail, Globe, Clock, MapPin, Navigation } from "lucide-react";
import { CATEGORY_LABELS, type AutismCenter } from "../types";

type Props = {
  center: AutismCenter | null;
  onClose: () => void;
  lang?: "en" | "fr";
  userLocation?: [number, number] | null;
};

export function CenterDetailPanel({ center, onClose, lang = "en", userLocation }: Props) {
  if (!center) return null;
  const t = (en: string, fr: string) => (lang === "fr" ? fr : en);

  const dirHref = `https://www.openstreetmap.org/directions?${
    userLocation ? `from=${userLocation[0]},${userLocation[1]}&` : ""
  }to=${center.latitude},${center.longitude}`;

  return (
    <aside
      role="dialog"
      aria-label={center.name}
      className="fixed inset-x-0 bottom-0 z-[1000] max-h-[80vh] overflow-y-auto rounded-t-3xl border-t border-border/60 bg-card p-6 shadow-card md:inset-y-0 md:right-0 md:left-auto md:max-h-none md:w-[400px] md:rounded-l-3xl md:rounded-tr-none md:border-l md:border-t-0"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="inline-block rounded-full bg-primary-soft px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
            {CATEGORY_LABELS[center.category][lang]}
          </span>
          <h2 className="mt-2 font-display text-xl font-bold leading-tight">{center.name}</h2>
          {(center.city || center.region) && (
            <p className="mt-1 text-sm text-muted-foreground">
              {[center.city, center.region].filter(Boolean).join(", ")}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t("Close", "Fermer")}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-muted hover:bg-muted/70"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {center.description && (
        <p className="mt-4 text-sm leading-relaxed text-foreground/90">{center.description}</p>
      )}

      {center.services_offered.length > 0 && (
        <section className="mt-5">
          <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            {t("Services offered", "Services proposés")}
          </h3>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {center.services_offered.map((s) => (
              <li key={s} className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium">
                {s}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-5 space-y-2 text-sm">
        {center.address && (
          <DetailRow icon={MapPin} label={t("Address", "Adresse")} value={center.address} />
        )}
        {center.opening_hours && (
          <DetailRow icon={Clock} label={t("Opening hours", "Horaires")} value={center.opening_hours} />
        )}
        {center.phone && (
          <DetailRow icon={Phone} label={t("Phone", "Téléphone")} value={center.phone} href={`tel:${center.phone}`} />
        )}
        {center.email && (
          <DetailRow icon={Mail} label="Email" value={center.email} href={`mailto:${center.email}`} />
        )}
        {center.website && (
          <DetailRow icon={Globe} label={t("Website", "Site web")} value={center.website} href={center.website} external />
        )}
      </section>

      <a
        href={dirHref}
        target="_blank"
        rel="noreferrer"
        className="mt-6 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl bg-foreground px-4 py-3 text-sm font-semibold text-background hover:opacity-90"
      >
        <Navigation className="h-4 w-4" /> {t("Get directions", "Itinéraire")}
      </a>
    </aside>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
  href,
  external,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
  href?: string;
  external?: boolean;
}) {
  const content = (
    <>
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <div className="min-w-0">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className="truncate">{value}</div>
      </div>
    </>
  );
  const cls = "flex items-start gap-2.5 rounded-xl p-2 -m-2 hover:bg-muted/50";
  if (href) {
    return (
      <a href={href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined} className={cls}>
        {content}
      </a>
    );
  }
  return <div className={cls}>{content}</div>;
}

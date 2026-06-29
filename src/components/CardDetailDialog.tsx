import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Volume2, Plus } from "lucide-react";
import type { CommCard } from "@/lib/comm-data";
import { toneClass } from "@/lib/comm-data";
import { useTTS } from "@/lib/tts";
import { usePrefs } from "@/lib/prefs";

export function CardDetailDialog({
  card,
  open,
  onOpenChange,
  onAddToSentence,
}: {
  card: CommCard | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onAddToSentence?: (c: CommCard) => void;
}) {
  const { lang, voiceRate } = usePrefs();
  const { speak, supported } = useTTS(lang, voiceRate);

  if (!card) return null;
  const labelEn = card.label;
  const labelFr = card.fr;
  const primary = lang === "fr" ? labelFr : labelEn;
  const secondary = lang === "fr" ? labelEn : labelFr;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center font-display text-2xl font-extrabold">
            {primary}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-2">
          <div className={`grid h-44 w-44 place-items-center overflow-hidden rounded-3xl shadow-soft ${toneClass(card.tone)}`}>
            {card.img ? (
              <img src={card.img} alt={primary} className="h-full w-full object-contain" />
            ) : (
              <span className="text-7xl" aria-hidden>{card.emoji}</span>
            )}
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">{secondary}</div>
          </div>
          <div className="flex w-full flex-wrap justify-center gap-2">
            {supported && (
              <button
                onClick={() => speak(primary)}
                className="flex items-center gap-1.5 rounded-full bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow"
              >
                <Volume2 className="h-4 w-4" /> {lang === "fr" ? "Parler" : "Speak"}
              </button>
            )}
            {onAddToSentence && (
              <button
                onClick={() => {
                  onAddToSentence(card);
                  onOpenChange(false);
                }}
                className="flex items-center gap-1.5 rounded-full bg-muted px-5 py-2.5 text-sm font-semibold hover:bg-muted/70"
              >
                <Plus className="h-4 w-4" /> {lang === "fr" ? "Ajouter à la phrase" : "Add to sentence"}
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { useEffect, useRef, useState } from "react";
import { Loader2, Upload, X, ZoomIn } from "lucide-react";
import { toast } from "sonner";
import { usePrefs } from "@/lib/prefs";

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (dataUrl: string) => Promise<void> | void;
};

const SIZE = 320; // canvas square

export function AvatarCropper({ open, onClose, onSave }: Props) {
  const { lang } = usePrefs();
  const fileRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [busy, setBusy] = useState<"none" | "ai" | "save">("none");
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!open) {
      setSrc(null);
      setZoom(1);
      setPos({ x: 0, y: 0 });
      setBusy("none");
    }
  }, [open]);

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) return toast.error(lang === "fr" ? "Image trop grande" : "Image too large");
    const reader = new FileReader();
    reader.onload = () => {
      setSrc(reader.result as string);
      setZoom(1);
      setPos({ x: 0, y: 0 });
    };
    reader.readAsDataURL(f);
  };

  const onMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    const p = "touches" in e ? e.touches[0] : (e as React.MouseEvent);
    dragRef.current = { x: p.clientX, y: p.clientY, ox: pos.x, oy: pos.y };
  };
  const onMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!dragRef.current) return;
    const p = "touches" in e ? e.touches[0] : (e as React.MouseEvent);
    setPos({
      x: dragRef.current.ox + (p.clientX - dragRef.current.x),
      y: dragRef.current.oy + (p.clientY - dragRef.current.y),
    });
  };
  const onMouseUp = () => { dragRef.current = null; };

  const renderCrop = (): string | null => {
    if (!src || !imgRef.current) return null;
    const img = imgRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    // Image is rendered at base size to fit inside the SIZE square (object-cover style)
    const baseScale = Math.max(SIZE / img.naturalWidth, SIZE / img.naturalHeight);
    const drawW = img.naturalWidth * baseScale * zoom;
    const drawH = img.naturalHeight * baseScale * zoom;
    const cx = SIZE / 2 + pos.x;
    const cy = SIZE / 2 + pos.y;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.drawImage(img, cx - drawW / 2, cy - drawH / 2, drawW, drawH);
    return canvas.toDataURL("image/jpeg", 0.88);
  };


  const onSaveClick = async () => {
    const url = renderCrop();
    if (!url) return;
    setBusy("save");
    try { await onSave(url); onClose(); }
    finally { setBusy("none"); }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-5 shadow-card">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold">
            {lang === "fr" ? "Photo de profil" : "Profile picture"}
          </h3>
          <button onClick={onClose} className="rounded-full p-1.5 text-muted-foreground hover:bg-muted" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        {!src ? (
          <button
            onClick={() => fileRef.current?.click()}
            className="mt-5 flex h-56 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-background text-sm text-muted-foreground hover:bg-muted"
          >
            <Upload className="h-6 w-6" />
            {lang === "fr" ? "Choisir une image" : "Choose an image"}
          </button>
        ) : (
          <>
            <div
              className="relative mx-auto mt-4 overflow-hidden rounded-full ring-4 ring-primary-soft"
              style={{ width: SIZE, height: SIZE, maxWidth: "100%" }}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
              onTouchStart={onMouseDown}
              onTouchMove={onMouseMove}
              onTouchEnd={onMouseUp}
            >
              <img
                ref={imgRef}
                src={src}
                alt=""
                draggable={false}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px)) scale(${zoom})`,
                  minWidth: SIZE,
                  minHeight: SIZE,
                  objectFit: "cover",
                  cursor: "grab",
                  userSelect: "none",
                }}
                className="select-none"
              />
            </div>

            <div className="mt-4 flex items-center gap-3">
              <ZoomIn className="h-4 w-4 text-muted-foreground" />
              <input
                type="range" min={1} max={3} step={0.01} value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1 accent-primary"
              />
            </div>

            <div className="mt-4">
              <button
                onClick={() => fileRef.current?.click()}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-muted px-4 py-2.5 text-sm font-semibold hover:bg-muted/70"
              >
                <Upload className="h-4 w-4" /> {lang === "fr" ? "Changer" : "Change"}
              </button>
            </div>
          </>
        )}

        <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPickFile} />

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-full bg-muted px-4 py-2 text-sm font-semibold hover:bg-muted/70">
            {lang === "fr" ? "Annuler" : "Cancel"}
          </button>
          <button
            onClick={onSaveClick}
            disabled={!src || busy !== "none"}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-50"
          >
            {busy === "save" && <Loader2 className="h-4 w-4 animate-spin" />}
            {lang === "fr" ? "Enregistrer" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

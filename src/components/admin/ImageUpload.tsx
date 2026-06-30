import { useRef, useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

function slugifyName(name: string) {
  const dot = name.lastIndexOf(".");
  const ext = dot >= 0 ? name.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, "") : "png";
  const base = (dot >= 0 ? name.slice(0, dot) : name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "image";
  return `${base}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
}

/**
 * Uploads an image from the device to the `card-images` Supabase Storage bucket
 * and reports the resulting public URL. Falls back gracefully on error.
 */
export function ImageUpload({
  value,
  onChange,
  bucket = "card-images",
}: {
  value: string | null;
  onChange: (url: string) => void;
  bucket?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image is larger than 5MB.");
      return;
    }
    setUploading(true);
    const path = slugifyName(file.name);
    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });
    setUploading(false);
    if (error) {
      toast.error("Upload failed", { description: error.message });
      return;
    }
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    onChange(data.publicUrl);
    toast.success("Image uploaded.");
  }

  return (
    <div className="flex items-center gap-3">
      {value ? (
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-border bg-muted">
          <img src={value} alt="preview" className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-0.5 top-0.5 grid h-5 w-5 place-items-center rounded-full bg-foreground/60 text-background"
            aria-label="Remove image"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl border border-dashed border-border text-muted-foreground">
          <Upload className="h-5 w-5" />
        </div>
      )}
      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleFile(f);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm hover:bg-muted disabled:opacity-50"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {uploading ? "Uploading…" : value ? "Replace image" : "Upload from device"}
        </button>
        <p className="mt-1 text-[11px] text-muted-foreground">PNG/JPG, up to 5MB. Or paste a URL below.</p>
      </div>
    </div>
  );
}

import logoUrl from "@/assets/kua-logo.png";

export function Logo({ size = 40, withWordmark = false, className = "" }: {
  size?: number;
  withWordmark?: boolean;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <img
        src={logoUrl}
        alt="KUA logo"
        width={size}
        height={size}
        className="object-contain"
        style={{ width: size, height: size }}
      />
      {withWordmark && (
        <span className="font-display text-xl font-extrabold tracking-tight">KUA</span>
      )}
    </span>
  );
}

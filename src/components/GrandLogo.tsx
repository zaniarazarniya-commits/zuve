type GrandLogoVariant = "light" | "gold-on-dark" | "compact";

interface GrandLogoProps {
  variant?: GrandLogoVariant;
  className?: string;
  width?: number;
}

const LOGO_SRC: Record<GrandLogoVariant, string> = {
  "light": "/Logos/Gran Hotel Lysekil_logo.png",
  "gold-on-dark": "/Logos/Grand Logo Guld.png",
  "compact": "/Logos/loga profilbild.jpg",
};

export function GrandLogo({ variant = "light", className = "", width = 160 }: GrandLogoProps) {
  const src = LOGO_SRC[variant];
  const height = variant === "compact" ? Math.round(width * 0.65) : Math.round(width * 1.1);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="Grand Hotel Lysekil"
      width={width}
      height={height}
      className={`object-contain select-none ${className}`}
      draggable={false}
    />
  );
}

export function GrandMonogram({ className = "", size = 48 }: { className?: string; size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/Logos/Kopia av GRAND MARKETING PLANERING.png"
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      className={`object-contain select-none ${className}`}
      draggable={false}
    />
  );
}

export function GrandSwash({ className = "", width = 80, gold = false }: { className?: string; width?: number; gold?: boolean }) {
  const src = gold
    ? "/Logos/grand loga del.png"
    : "/Logos/grand logga del.png";
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      aria-hidden="true"
      width={width}
      height={Math.round(width * 0.3)}
      className={`object-contain select-none ${className}`}
      draggable={false}
    />
  );
}

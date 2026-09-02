// ============================================================
// FIL: src/components/GroupLockup.tsx
//
// Dedikationslockup för gruppincheckningar: hotellets logotyp,
// en hårfin guldlinje, och gruppens namn i husets Baskerville.
//
// Poängen är att företagsnamnet ska läsas som en dedikation och
// inte som ett datafält. Därför guldtonen och den egna raden under
// linjen, i stället för den grå bruttotext namnet stod i tidigare.
// ============================================================

import { GrandLogo } from "@/components/GrandLogo";

export function GroupLockup({
  company,
  subtitle,
  logoWidth = 170,
}: {
  company: string;
  /** Valfri, tystare rad under namnet — vanligtvis datumet. */
  subtitle?: string;
  logoWidth?: number;
}) {
  return (
    <div className="flex flex-col items-center">
      <GrandLogo variant="light" width={logoWidth} />
      <div className="mt-4 w-8 h-px bg-accent" />
      <p className="mt-3 font-baskerville text-[9.5px] tracking-[0.32em] uppercase text-accent font-medium">
        {company}
      </p>
      {subtitle && (
        <p className="mt-1.5 font-baskerville text-[9px] tracking-[0.18em] uppercase text-granite-light">
          {subtitle}
        </p>
      )}
    </div>
  );
}

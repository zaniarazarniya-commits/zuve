// ============================================================
// FIL: src/app/incheckning/[slug]/flyer/page.tsx
//
// Utskrivbar A5-skylt med QR-koden till gruppens incheckning.
// Skriv ut och ställ i lobbyn eller vid receptionsdisken.
//
// Serverkomponent: företagsnamn och datum läses direkt ur
// gruppdefinitionen. Skylten går därför att skriva ut även innan
// databasen är uppsatt, och deltagarlistan hamnar aldrig i
// webbläsarens bundle — bara de två fälten nedan skickas vidare.
// ============================================================

import { notFound } from "next/navigation"
import { getGroup } from "@/lib/group-checkin-data"
import { FlyerView } from "./FlyerView"

export default async function CheckinFlyerPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const group = getGroup(slug)
  if (!group) notFound()

  const checkInLabel = new Date(`${group.checkIn}T00:00:00`).toLocaleDateString("sv-SE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  return <FlyerView slug={slug} company={group.company} checkInLabel={checkInLabel} />
}

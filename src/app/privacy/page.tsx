// ============================================================
// Integritetspolicy — Grand Hotel Lysekil Gästportal
// ============================================================

export const metadata = {
  title: "Integritetspolicy — Grand Hotel Lysekil",
}

export default function PrivacyPage() {
  return (
    <main className="min-h-full bg-background px-5 py-12">
      <div className="max-w-lg mx-auto space-y-8">
        <div className="text-center">
          <p className="text-[11px] font-medium tracking-[0.25em] uppercase text-muted mb-4">
            Grand Hotel Lysekil
          </p>
          <h1 className="text-[28px] font-semibold text-foreground leading-tight">
            Integritetspolicy
          </h1>
        </div>

        <div className="space-y-6 text-sm text-granite font-light leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">1. Vilka är vi?</h2>
            <p>
              Grand Hotel Lysekil (org.nr 556682-6889), Kungsgatan 36, 453 33 Lysekil,
              är personuppgiftsansvarig för behandlingen av dina personuppgifter i denna gästportal.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">2. Vilka uppgifter samlar vi in?</h2>
            <p>Vi samlar in följande personuppgifter om dig:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Namn (för- och efternamn)</li>
              <li>E-postadress</li>
              <li>Telefonnummer</li>
              <li>Bokningsdetaljer (datum, rum, antal gäster)</li>
              <li>Beräknad ankomsttid (ETA)</li>
              <li>Eventuella särskilda önskemål eller anteckningar</li>
              <li>Språkpreferens</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">3. Varför samlar vi in dem?</h2>
            <p>Vi behandlar dina personuppgifter för att:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Tillhandahålla din bokningsinformation digitalt</li>
              <li>Skicka välkomstmeddelande via SMS eller e-post</li>
              <li>Förbereda din incheckning (ETA)</li>
              <li>Hantera dina tillvalsintressen</li>
            </ul>
            <p className="mt-2">
              Den rättsliga grunden är <strong>avtalsfullgörande</strong> — vi behöver uppgifterna
              för att fullfölja vårt värdskapsavtal med dig.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">4. Hur länge sparas uppgifterna?</h2>
            <p>
              Dina personuppgifter sparas i upp till 90 dagar efter din utcheckning.
              Därefter pseudonymiseras eller raderas de automatiskt.
              Aggregerad bokningsstatistik (utan personuppgifter) kan sparas längre för affärsanalys.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">5. Vem får ta del av uppgifterna?</h2>
            <p>
              Endast auktoriserad personal på Grand Hotel Lysekil och våra IT-leverantörer
              (se nedan) har tillgång till dina uppgifter.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">6. Underbiträden</h2>
            <p>Vi anlitar följande personuppgiftsbiträden:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Supabase</strong> — databashantering</li>
              <li><strong>46elks</strong> — SMS-utskick</li>
              <li><strong>Vår e-postleverantör</strong> — e-postutskick</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">7. Dina rättigheter</h2>
            <p>Du har rätt att:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Begära tillgång till dina personuppgifter</li>
              <li>Begära rättelse av felaktiga uppgifter</li>
              <li>Begära radering av dina uppgifter</li>
              <li>Invända mot behandling</li>
              <li>Tacka nej till framtida SMS och e-post</li>
            </ul>
            <p className="mt-2">
              För att utöva dina rättigheter, kontakta oss på{" "}
              <a href="mailto:info@grandhotellysekil.se" className="text-sea hover:text-primary">
                info@grandhotellysekil.se
              </a>{" "}
              eller ring 0523-61 10 00.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">8. Säkerhet</h2>
            <p>
              Dina uppgifter lagras krypterat och skyddas av strikta åtkomstkontroller.
              Vi använder TLS-kryptering för all dataöverföring.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">9. Kontakt</h2>
            <p>
              Har du frågor om hur vi hanterar dina personuppgifter?
              Kontakta oss på{" "}
              <a href="mailto:info@grandhotellysekil.se" className="text-sea hover:text-primary">
                info@grandhotellysekil.se
              </a>
            </p>
          </section>
        </div>

        <div className="pt-8 text-center">
          <a
            href="/"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl border border-sand bg-white/60 backdrop-blur-sm text-xs font-medium tracking-[0.2em] uppercase text-primary hover:bg-white hover:border-accent/30 transition-all duration-500"
          >
            Tillbaka till startsidan
          </a>
        </div>
      </div>
    </main>
  )
}

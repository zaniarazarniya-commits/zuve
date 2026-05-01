export default function Home() {
  return (
    <main className="min-h-screen bg-[#faf9f6] flex flex-col items-center justify-center px-6 text-center">
      <div className="max-w-md space-y-8">
        {/* Logo / Hotel name */}
        <div className="space-y-3">
          <p className="text-[11px] uppercase tracking-[0.25em] text-[#8c7c6c]">Grand Hotel Lysekil</p>
          <h1 className="font-serif text-4xl font-light text-[#1a1a1a] tracking-tight">Zuve</h1>
          <p className="text-sm text-[#8c7c6c] font-light">Din personliga gästportal</p>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-[#d4cfc7]" />
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-[#b5a89a]" stroke="currentColor" strokeWidth="1.5">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0116 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <div className="flex-1 h-px bg-[#d4cfc7]" />
        </div>

        {/* Message */}
        <div className="space-y-4 text-[#4a4a4a]">
          <p className="text-base leading-relaxed font-light">
            Välkommen till Grand Hotel Lysekils gästportal. Här kan du som gäst se din bokning, lägga till tillval och upptäcka det bästa av Lysekil.
          </p>
          <p className="text-sm text-[#8c7c6c] leading-relaxed">
            Du når din personliga sida via länken i SMS:et du fick vid bokning. Har du inte fått något SMS? Kontakta receptionen så hjälper vi dig.
          </p>
        </div>

        {/* Contact */}
        <div className="pt-4">
          <a
            href="tel:+4652310120"
            className="inline-flex items-center gap-2 text-sm text-[#1a1a1a] hover:text-[#8c7c6c] transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
            </svg>
            0523 — 101 20
          </a>
        </div>

        {/* Footer */}
        <p className="text-[11px] text-[#b5a89a] tracking-wide">
          Strandvägen 1 · 453 30 Lysekil
        </p>
      </div>
    </main>
  )
}

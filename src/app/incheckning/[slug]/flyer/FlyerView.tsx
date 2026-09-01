"use client";

// ============================================================
// FIL: src/app/incheckning/[slug]/flyer/FlyerView.tsx
//
// Själva skylten. Tar emot företagsnamn och datum som props från
// serverkomponenten, så att deltagarlistan aldrig hamnar i
// webbläsarens bundle.
// ============================================================

import { useSyncExternalStore } from "react";
import QRCode from "react-qr-code";

/** Prenumeration som aldrig ändras — adressen är konstant per sidladdning. */
const subscribe = () => () => {};

export function FlyerView({
  slug,
  company,
  checkInLabel,
}: {
  slug: string;
  company: string;
  checkInLabel: string;
}) {
  // window finns inte vid serverrendering. useSyncExternalStore låter oss
  // läsa adressen utan att riskera en hydreringsavvikelse.
  const origin = useSyncExternalStore(
    subscribe,
    () => window.location.origin,
    () => ""
  );

  // Byggs från webbläsarens egen adress, så skylten alltid pekar på samma
  // domän som du öppnade den på.
  const checkinUrl = origin ? `${origin}/incheckning/${slug}` : null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Great+Vibes&family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #e8e4de; }

        .flyer-wrap {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 24px 16px 40px;
          background: #e8e4de;
        }

        .print-btn {
          display: block;
          margin-bottom: 20px;
          padding: 10px 32px;
          background: #1a3a4a;
          color: white;
          border: none;
          border-radius: 4px;
          font-family: 'Libre Baskerville', serif;
          font-size: 10px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .print-btn:hover { opacity: 0.85; }

        .flyer-page {
          width: 148mm;
          min-height: 210mm;
          background: #f4f1ec;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 11mm 13mm 10mm;
          box-shadow: 0 8px 40px rgba(0,0,0,0.18);
        }

        .flyer-border {
          position: absolute;
          top: 6mm; left: 6mm; right: 6mm; bottom: 6mm;
          border: 1px solid #c9a96e;
          pointer-events: none;
        }

        .flyer-border-inner {
          position: absolute;
          top: 8mm; left: 8mm; right: 8mm; bottom: 8mm;
          border: 0.5px solid rgba(201,169,110,0.4);
          pointer-events: none;
        }

        .f-baskerville { font-family: 'Libre Baskerville', Baskerville, Georgia, serif; }
        .f-script      { font-family: 'Great Vibes', cursive; }
        .f-serif       { font-family: 'Cormorant Garamond', Georgia, serif; }

        .instruction-box {
          background: white;
          border: 1px solid rgba(212,200,184,0.8);
          border-radius: 4px;
          padding: 13px 17px;
          width: 100%;
          max-width: 250px;
          margin-bottom: 14px;
          box-shadow: 0 2px 12px rgba(26,58,74,0.06);
        }

        .qr-box {
          background: white;
          padding: 10px;
          border-radius: 4px;
          border: 1px solid rgba(212,200,184,0.6);
          box-shadow: 0 2px 12px rgba(26,58,74,0.06);
          margin-bottom: 7px;
        }

        @media print {
          html, body { background: white; margin: 0; padding: 0; }
          .print-btn { display: none !important; }
          .flyer-wrap { padding: 0; background: white; min-height: unset; }
          .flyer-page {
            width: 148mm;
            min-height: 210mm;
            box-shadow: none;
            page-break-after: always;
          }
        }

        @media screen and (max-width: 600px) {
          .flyer-page { width: 100%; min-height: unset; }
        }
      `}</style>

      <div className="flyer-wrap">
        <button className="print-btn" onClick={() => window.print()}>
          Skriv ut / Spara som PDF
        </button>

        <div className="flyer-page">
          <div className="flyer-border" />
          <div className="flyer-border-inner" />

          {/* Logotyp */}
          <div style={{ marginTop: 6, marginBottom: 10 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/Logos/Gran Hotel Lysekil_logo.png"
              alt="Grand Hotel Lysekil"
              style={{ width: 108, display: "block", margin: "0 auto", mixBlendMode: "multiply" }}
            />
          </div>

          <p
            className="f-baskerville"
            style={{
              fontSize: 7,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "#8a7f72",
              margin: "0 0 9px",
              textAlign: "center",
            }}
          >
            Bohuslän
          </p>

          <div style={{ width: 36, height: 1, background: "#c9a96e", margin: "0 auto 14px" }} />

          {/* Företag */}
          <p
            className="f-baskerville"
            style={{
              fontSize: 7,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "#c9a96e",
              margin: "0 0 3px",
              textAlign: "center",
            }}
          >
            {company}
          </p>

          <h1
            className="f-script"
            style={{
              fontSize: 48,
              color: "#1a3a4a",
              margin: "0 0 3px",
              textAlign: "center",
              lineHeight: 1.1,
            }}
          >
            Incheckning
          </h1>

          <p
            className="f-serif"
            style={{
              fontSize: 10,
              fontStyle: "italic",
              color: "#5a5c5e",
              margin: "0 0 14px",
              textAlign: "center",
              lineHeight: 1.5,
            }}
          >
            {checkInLabel}
          </p>

          <div style={{ width: 36, height: 1, background: "#c9a96e", margin: "0 auto 16px" }} />

          {/* Instruktioner */}
          <div className="instruction-box">
            <p
              className="f-baskerville"
              style={{
                fontSize: 7,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#8a7f72",
                margin: "0 0 9px",
                textAlign: "center",
              }}
            >
              Så här checkar du in
            </p>
            <ol style={{ margin: 0, padding: 0, listStyle: "none", color: "#1a3a4a" }}>
              {[
                "Skanna QR-koden med din telefon",
                "Välj ditt namn i listan",
                "Fyll i e-post och telefonnummer",
                "Du får ditt rumsnummer direkt",
              ].map((step, i) => (
                <li
                  key={i}
                  className="f-serif"
                  style={{ fontSize: 10.5, lineHeight: 1.7, color: "#1a3a4a", textAlign: "center" }}
                >
                  <span style={{ color: "#c9a96e", marginRight: 5 }}>{i + 1}.</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          {/* QR-kod */}
          <div className="qr-box">
            {checkinUrl ? (
              <QRCode
                value={checkinUrl}
                size={140}
                bgColor="#ffffff"
                fgColor="#1a3a4a"
                style={{ display: "block" }}
              />
            ) : (
              <div style={{ width: 140, height: 140 }} />
            )}
          </div>

          <p
            className="f-baskerville"
            style={{
              fontSize: 6.5,
              letterSpacing: "0.16em",
              color: "#9da0a3",
              margin: "0 0 10px",
              textAlign: "center",
              wordBreak: "break-all",
              maxWidth: "80%",
            }}
          >
            {checkinUrl ?? " "}
          </p>

          <p
            className="f-serif"
            style={{
              fontSize: 10,
              color: "#5a5c5e",
              margin: "0 0 6px",
              textAlign: "center",
              lineHeight: 1.5,
              maxWidth: "85%",
            }}
          >
            Sedan går du till receptionen och säger ditt rumsnummer — så får du dina nycklar.
          </p>

          {/* Monogram */}
          <div style={{ marginTop: "auto", marginBottom: 7 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/Logos/Kopia av GRAND MARKETING PLANERING.png"
              alt=""
              aria-hidden="true"
              style={{ width: 24, display: "block", margin: "0 auto", opacity: 0.4 }}
            />
          </div>

          <p
            className="f-baskerville"
            style={{
              fontSize: 6.5,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#9da0a3",
              margin: "5px 0 0",
              textAlign: "center",
            }}
          >
            Grand Hotel Lysekil · Kungsgatan 36 · 453 33 Lysekil · 0523–61 10 00
          </p>
        </div>
      </div>
    </>
  );
}

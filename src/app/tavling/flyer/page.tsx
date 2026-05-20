"use client";

import QRCode from "react-qr-code";

const TAVLING_URL = "https://guest.grandhotellysekil.se/tavling";

export default function FlyerPage() {
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
          width: 210mm;
          min-height: 297mm;
          background: #f4f1ec;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 16mm 18mm 14mm;
          box-shadow: 0 8px 40px rgba(0,0,0,0.18);
        }

        .flyer-border {
          position: absolute;
          top: 9mm; left: 9mm; right: 9mm; bottom: 9mm;
          border: 1px solid #c9a96e;
          pointer-events: none;
        }

        .flyer-border-inner {
          position: absolute;
          top: 11mm; left: 11mm; right: 11mm; bottom: 11mm;
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
          padding: 18px 24px;
          width: 100%;
          max-width: 340px;
          margin-bottom: 20px;
          box-shadow: 0 2px 12px rgba(26,58,74,0.06);
        }

        .qr-box {
          background: white;
          padding: 14px;
          border-radius: 4px;
          border: 1px solid rgba(212,200,184,0.6);
          box-shadow: 0 2px 12px rgba(26,58,74,0.06);
          margin-bottom: 10px;
        }

        @media print {
          html, body { background: white; margin: 0; padding: 0; }
          .print-btn { display: none !important; }
          .flyer-wrap { padding: 0; background: white; min-height: unset; }
          .flyer-page {
            width: 210mm;
            min-height: 297mm;
            box-shadow: none;
            page-break-after: always;
          }
        }

        @media screen and (max-width: 800px) {
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
          <div style={{ marginTop: 8, marginBottom: 14 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/Logos/Gran Hotel Lysekil_logo.png"
              alt="Grand Hotel Lysekil"
              style={{ width: 150, display: "block", margin: "0 auto", mixBlendMode: "multiply" }}
            />
          </div>

          {/* Est. tag */}
          <p className="f-baskerville" style={{
            fontSize: 8, letterSpacing: "0.3em", textTransform: "uppercase",
            color: "#8a7f72", margin: "0 0 12px", textAlign: "center",
          }}>
            Est. 1934 · Bohuslän
          </p>

          {/* Guldlinje */}
          <div style={{ width: 44, height: 1, background: "#c9a96e", margin: "0 auto 20px" }} />

          {/* Tävling-tag */}
          <p className="f-baskerville" style={{
            fontSize: 8, letterSpacing: "0.32em", textTransform: "uppercase",
            color: "#c9a96e", margin: "0 0 4px", textAlign: "center",
          }}>
            Tävling
          </p>

          {/* Rubrik */}
          <h1 className="f-script" style={{
            fontSize: 68, color: "#1a3a4a", margin: "0 0 4px",
            textAlign: "center", lineHeight: 1.1,
          }}>
            Vinn en Hotellfrukost
          </h1>

          <p className="f-serif" style={{
            fontSize: 11.5, fontStyle: "italic", color: "#5a5c5e",
            margin: "0 0 20px", textAlign: "center", lineHeight: 1.5,
          }}>
            för en person på Grand Hotel Lysekil
          </p>

          {/* Guldlinje */}
          <div style={{ width: 44, height: 1, background: "#c9a96e", margin: "0 auto 24px" }} />

          {/* Instruktionsbox */}
          <div className="instruction-box">
            <p className="f-baskerville" style={{
              fontSize: 8, letterSpacing: "0.24em", textTransform: "uppercase",
              color: "#8a7f72", margin: "0 0 12px", textAlign: "center",
            }}>
              Så här deltar du
            </p>
            <ol style={{ margin: 0, padding: 0, listStyle: "none", color: "#1a3a4a" }}>
              {[
                "Skanna QR-koden nedan med din telefon",
                "Fyll i dina uppgifter på sidan som öppnas",
                "Vi lottar bland alla deltagare – lycka till!",
              ].map((step, i) => (
                <li key={i} className="f-serif" style={{
                  fontSize: 12, lineHeight: 1.75, color: "#1a3a4a",
                  textAlign: "center",
                }}>
                  <span style={{ color: "#c9a96e", marginRight: 6 }}>{i + 1}.</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          {/* QR-kod */}
          <div className="qr-box">
            <QRCode
              value={TAVLING_URL}
              size={185}
              bgColor="#ffffff"
              fgColor="#1a3a4a"
              style={{ display: "block" }}
            />
          </div>

          <p className="f-baskerville" style={{
            fontSize: 7.5, letterSpacing: "0.18em", color: "#9da0a3",
            margin: "0 0 28px", textAlign: "center",
          }}>
            {TAVLING_URL}
          </p>

          {/* Monogram footer */}
          <div style={{ marginTop: "auto", marginBottom: 10 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/Logos/Kopia av GRAND MARKETING PLANERING.png"
              alt=""
              aria-hidden="true"
              style={{ width: 34, display: "block", margin: "0 auto", opacity: 0.4 }}
            />
          </div>

          {/* Adresstext */}
          <p className="f-baskerville" style={{
            fontSize: 7.5, letterSpacing: "0.22em", textTransform: "uppercase",
            color: "#9da0a3", margin: "6px 0 0", textAlign: "center",
          }}>
            Grand Hotel Lysekil · Kungsgatan 36 · 453 33 Lysekil · 0523–61 10 00
          </p>
        </div>
      </div>
    </>
  );
}

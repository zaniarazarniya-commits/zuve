"use client";

import { useEffect, useState, useCallback } from "react";

type Entry = {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  visit_reason: string;
  created_at: string;
};

type MonthData = {
  key: string;   // "2026-05"
  label: string; // "Maj 2026"
  entries: Entry[];
};

const SV_MONTHS = [
  "Januari", "Februari", "Mars", "April", "Maj", "Juni",
  "Juli", "Augusti", "September", "Oktober", "November", "December",
];

function toMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function toMonthLabel(key: string) {
  const [y, m] = key.split("-").map(Number);
  return `${SV_MONTHS[m - 1]} ${y}`;
}

export default function AdminTavlingPage() {
  const [months, setMonths] = useState<MonthData[]>([]);
  const [activeKey, setActiveKey] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/admin/tavling/entries");
      if (!res.ok) { setLoading(false); return; }
      const data: Entry[] = await res.json();

      const map = new Map<string, Entry[]>();
      for (const e of data) {
        const key = toMonthKey(new Date(e.created_at));
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(e);
      }

      const sorted = Array.from(map.entries())
        .sort((a, b) => b[0].localeCompare(a[0]))
        .map(([key, entries]) => ({ key, label: toMonthLabel(key), entries }));

      setMonths(sorted);
      if (sorted.length > 0) setActiveKey(sorted[0].key);
      setLoading(false);
    }
    load();
  }, []);

  const activeMonth = months.find((m) => m.key === activeKey);

  const copyEmails = useCallback(() => {
    if (!activeMonth) return;
    const emails = activeMonth.entries.map((e) => e.email).join(", ");
    navigator.clipboard.writeText(emails).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [activeMonth]);

  return (
    <main className="min-h-screen bg-background px-6 py-12">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <p className="text-[9.5px] tracking-[0.3em] uppercase text-accent font-medium mb-2">
            Administration
          </p>
          <h1 className="font-serif text-[32px] text-primary leading-tight tracking-tight">
            Tävlingsanmälningar
          </h1>
          <div className="mt-3 w-8 h-px bg-accent" />
        </div>

        {loading && (
          <p className="text-[12.5px] text-granite">Laddar…</p>
        )}

        {!loading && months.length === 0 && (
          <p className="text-[12.5px] text-granite">Inga anmälningar ännu.</p>
        )}

        {!loading && months.length > 0 && (
          <>
            {/* Month tabs */}
            <div className="flex gap-2 flex-wrap mb-8">
              {months.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setActiveKey(m.key)}
                  className={`px-4 py-2 rounded-[4px] text-[10px] tracking-[0.2em] uppercase font-medium transition-colors ${
                    m.key === activeKey
                      ? "bg-primary text-white"
                      : "bg-sand-light text-granite hover:bg-sand"
                  }`}
                >
                  {m.label}
                  <span className="ml-2 opacity-60">{m.entries.length}</span>
                </button>
              ))}
            </div>

            {activeMonth && (
              <>
                {/* Actions */}
                <div className="flex gap-3 mb-6 flex-wrap">
                  <a
                    href={`/api/admin/tavling/export?month=${activeKey}`}
                    className="px-4 py-2.5 rounded-[4px] bg-primary text-white text-[10px] tracking-[0.2em] uppercase font-medium transition-opacity hover:opacity-80"
                  >
                    Exportera Excel
                  </a>
                  <button
                    onClick={copyEmails}
                    className="px-4 py-2.5 rounded-[4px] border border-sand bg-white text-[10px] tracking-[0.2em] uppercase font-medium text-primary transition-colors hover:border-primary"
                  >
                    {copied ? "Kopierat!" : "Kopiera e-poster"}
                  </button>
                </div>

                {/* Summary */}
                <p className="text-[11px] text-granite-light mb-4">
                  {activeMonth.entries.length} anmälningar — {activeMonth.label}
                </p>

                {/* Table */}
                <div className="overflow-x-auto rounded-[4px] border border-sand">
                  <table className="w-full text-[12px] text-foreground">
                    <thead>
                      <tr className="border-b border-sand bg-sand-light">
                        {["Namn", "Telefon", "E-post", "Stad", "Anledning", "Datum"].map((h) => (
                          <th
                            key={h}
                            className="px-4 py-3 text-left text-[9px] tracking-[0.2em] uppercase font-medium text-granite whitespace-nowrap"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {activeMonth.entries.map((e, i) => (
                        <tr
                          key={e.id}
                          className={`border-b border-sand last:border-0 ${i % 2 === 0 ? "bg-white" : "bg-background"}`}
                        >
                          <td className="px-4 py-3 whitespace-nowrap">{e.name}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-granite">{e.phone}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sea">{e.email}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-granite">{e.city}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-granite">{e.visit_reason}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-granite-light">
                            {new Date(e.created_at).toLocaleDateString("sv-SE")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}

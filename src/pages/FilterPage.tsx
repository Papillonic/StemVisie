"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { posthog} from "../lib/posthog";
import Layout from "../components/Layout";
import GlassCard from "../components/GlassCard";
import StickyBar from "../components/StickyBar";
import { mockAmendments, mockParties } from "../lib/mockData";
import KamerHalveCirkel from "../components/KamerHalveCirkelWelcomeReal";
import {
  kamerLayoutNov2023_Nov2025,
  kamerLayoutVanafFeb2026,
} from "../lib/kamerLayouts";

import type { Amendment } from "../types";


export default function FilterPage() {
  const navigate = useNavigate();

  const today = new Date();

  const chamberLayout =
    today >= new Date(kamerLayoutVanafFeb2026.startDate)
      ? kamerLayoutVanafFeb2026
      : kamerLayoutNov2023_Nov2025;

  const partyMap = useMemo(
    () =>
      Object.fromEntries(
        mockParties.map((p) => [p.abbreviation, p.name])
      ),
    []
  );

const amendments = mockAmendments;

  const partyAbbreviations = [
    ...new Set(
      chamberLayout.seats.map((s) => s.partyAbbreviation)
    ),
  ];

const openFeedback = () => {
  posthog.capture("feedback_clicked");

  window.open(
    "https://tally.so/r/812e0O",
    "_blank"
  );
};

amendments.sort((a, b) => {
  const dateA = new Date(a.stemDatum ?? 0).getTime();
  const dateB = new Date(b.stemDatum ?? 0).getTime();

  return dateB - dateA;
});
const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  const check = () => setIsMobile(window.innerWidth < 768);
  check();
  window.addEventListener("resize", check);
  return () => window.removeEventListener("resize", check);
}, []);

  const generateRandomParties = useCallback(
    () =>
      partyAbbreviations.map((abbr) => {
        const random = Math.random();

        return {
          id: abbr,
          name: partyMap[abbr] ?? abbr,
          abbreviation: abbr,
	  color: abbr,
          votes: {
            welcome: {
              voor: random < 0.5 ? 1 : 0,
              tegen: random >= 0.5 ? 1 : 0,
              onthouden: 0,
            },
          },
        };
      }),
    [partyAbbreviations, partyMap]
  );

  const [partiesWithVotes, setPartiesWithVotes] =
    useState(generateRandomParties());

  useEffect(() => {
    const interval = setInterval(() => {
      setPartiesWithVotes(generateRandomParties());
    }, 1500);

    return () => clearInterval(interval);
  }, [generateRandomParties]);

  // ===== FILTER STATE (UNCHANGED) =====
  const [search, setSearch] = useState("");
  const [categorie, setCategorie] = useState("");
  const [indienerNaam, setIndienerNaam] = useState("");
  const [indienerFractie, setIndienerFractie] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const getCategorieArray = (cat: any) => {
    if (!cat) return [];
    return Array.isArray(cat) ? cat : [cat];
  };


const geldigeIndieners = (
  indieners: Amendment["indieners"] = []
) => (indieners ?? []).filter((i) => i.naam !== "TK");
  const filteredAmendments = useMemo(() => {
    return mockAmendments.filter((a) => {
      if (
        search &&
        !a.title.toLowerCase().includes(search.toLowerCase())
      )
        return false;

      if (
        categorie &&
        !getCategorieArray(a.Categorie).some((c) =>
          c.toLowerCase().includes(categorie.toLowerCase())
        )
      )
        return false;

      const indieners = geldigeIndieners(a.indieners);

      if (
        indienerNaam &&
        !indieners.some((i) => i.naam === indienerNaam)
      )
        return false;

      if (
        indienerFractie &&
        !indieners.some((i) => i.fractie === indienerFractie)
      )
        return false;

      if (dateFrom) {
  if (
    !a.stemDatum ||
    new Date(a.stemDatum).getTime() < new Date(dateFrom).getTime()
  ) {
    return false;
  }
}

if (dateTo) {
  if (
    !a.stemDatum ||
    new Date(a.stemDatum).getTime() > new Date(dateTo).getTime()
  ) {
    return false;
  }
}

      return true;
    });
  }, [
    search,
    categorie,
    indienerNaam,
    indienerFractie,
    dateFrom,
    dateTo,
  ]);

  const noResults = filteredAmendments.length === 0;

  // ✅ ONLY FIX HERE (clean session start, no UI changes)
  const handleStartVoting = () => {
    localStorage.removeItem("voting_amendments");
    localStorage.removeItem("voting_userVotes");
    localStorage.removeItem("voting_index");

    if (filteredAmendments.length === 0) return;

posthog.capture('voting session started', {
  source: 'custom_filter',
  amendment_count: filteredAmendments.length,
  has_search: !!search,
  has_categorie: !!categorie,
  has_indiener: !!indienerNaam,
  has_fractie: !!indienerFractie,
  has_date_range: !!(dateFrom || dateTo),
});

    localStorage.setItem(
      "voting_amendments",
      JSON.stringify(filteredAmendments)
    );

    navigate("/voting", {
      state: { amendments: filteredAmendments },
    });
  };

  const resetFilters = () => {
    setSearch("");
    setCategorie("");
    setIndienerNaam("");
    setIndienerFractie("");
    setDateFrom("");
    setDateTo("");
  };

  const inputClass =
    "w-full mt-1 bg-white/60 border border-white/80 rounded-lg h-9 px-3 text-sm text-black font-semibold";

  return (
    <Layout>
      <div className="fixed top-0 left-0 w-full flex justify-center z-0 pointer-events-none">
        <div className="w-full max-w-3xl">
          <KamerHalveCirkel
            parties={partiesWithVotes}
            amendmentId="welcome"
            chamberLayout={chamberLayout}
       scale={isMobile ? 1.1 : 0.75}
          />
        </div>
      </div>

      <div className="relative flex flex-col items-center w-full px-4 pb-32">
   <GlassCard
  className={`w-full p-6 overflow-y-auto space-y-4 ${
    isMobile
      ? "h-[520px] -mt-16"
      : "h-[400px] -mt-2"
  }`}
>
<div className="w-full flex justify-end mb-2">
  <button
  onClick={openFeedback}
  className="text-white/60 text-xs font-bold hover:text-white transition"
>
  💬 Feedback
</button>
</div>       

 <p className="text-white font-semibold text-lg leading-snug">
            Stel hier je filters in om moties te selecteren waarop je wilt stemmen.
          </p>

          {/* ===== FILTERS (VOLLEDIG TERUGGEZET) ===== */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold text-white block">Zoekterm</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={inputClass}
                placeholder="Zoek op titel..."
              />
            </div>

            <div>
              <label className="text-sm font-bold text-white block">Categorie</label>
              <select
                value={categorie}
                onChange={(e) => setCategorie(e.target.value)}
                className={inputClass}
              >
                <option value="">Alle categorieën</option>
                {Array.from(
                  new Set(
                    mockAmendments.flatMap((a) =>
                      getCategorieArray(a.Categorie)
                    )
                  )
                ).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-bold text-white block">Indiener</label>
              <select
                value={indienerNaam}
                onChange={(e) => setIndienerNaam(e.target.value)}
                className={inputClass}
              >
                <option value="">Alle indieners</option>
                {Array.from(
                  new Set(
                    mockAmendments.flatMap((a) =>
                      geldigeIndieners(a.indieners).map((i) => i.naam)
                    )
                  )
                ).map((naam) => (
                  <option key={naam} value={naam}>
                    {naam}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-bold text-white block">Fractie</label>
              <select
                value={indienerFractie}
                onChange={(e) => setIndienerFractie(e.target.value)}
                className={inputClass}
              >
                <option value="">Alle fracties</option>
                {Array.from(
                  new Set(
                    mockAmendments.flatMap((a) =>
                      geldigeIndieners(a.indieners)
                        .map((i) => i.fractie)
                        .filter(Boolean)
                    )
                  )
                ).map((f) => (
                  <option key={f ?? ""} value={f ?? ""}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-bold text-white block">Datum van</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className="text-sm font-bold text-white block">Datum tot</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <p className="text-white font-semibold pt-2">
            {filteredAmendments.length} moties gevonden
          </p>

          {noResults && (
            <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-3">
              <p className="text-red-100 font-bold text-sm text-center">
                Geen moties gevonden met deze filters.
              </p>

              <div className="flex justify-center mt-3">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 text-sm rounded-lg bg-white/20 text-white font-bold hover:bg-white/30"
                >
                  Reset filters
                </button>
              </div>
            </div>
          )}
        </GlassCard>
      </div>

      <StickyBar>
        <div className="w-full max-w-md mx-auto px-4 flex justify-center">
          <button
            disabled={noResults}
            className={`w-auto px-4 py-2 text-sm rounded-lg text-white transition-colors ${
              noResults
                ? "bg-gray-500 opacity-50 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
            onClick={handleStartVoting}
          >
            Stem op de moties
          </button>
        </div>
      </StickyBar>
    </Layout>
  );
}
"use client";

import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import GlassCard from "../components/GlassCard";
import StickyBar from "../components/StickyBar";
import { mockAmendments, mockParties } from "../lib/mockData";
import KamerHalveCirkel from "../components/KamerHalveCirkelWelcomeReal";
import {
  kamerLayoutNov2023_Nov2025,
  kamerLayoutVanafFeb2026,
} from "../lib/kamerLayouts";

export default function FilterPage() {
  const navigate = useNavigate();

  // ===== Kamer visual =====
  const today = new Date();
  const chamberLayout =
    today >= new Date(kamerLayoutVanafFeb2026.startDate)
      ? kamerLayoutVanafFeb2026
      : kamerLayoutNov2023_Nov2025;

  // ✅ partyMap toevoegen
  const partyMap = useMemo(
    () =>
      Object.fromEntries(
        mockParties.map((p) => [p.abbreviation, p.name])
      ),
    []
  );

  const partyAbbreviations = [
    ...new Set(chamberLayout.seats.map((s) => s.partyAbbreviation)),
  ];

  const generateRandomParties = () =>
    partyAbbreviations.map((abbr) => {
      const random = Math.random();

      return {
        id: abbr,
        name: partyMap[abbr] ?? abbr, // ✅ FIX
        abbreviation: abbr,
        votes: {
          welcome: {
            voor: random < 0.5 ? 1 : 0,
            tegen: random >= 0.5 ? 1 : 0,
            onthouden: 0,
          },
        },
      };
    });

  const [partiesWithVotes, setPartiesWithVotes] = useState(
    generateRandomParties()
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setPartiesWithVotes(generateRandomParties());
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // ===== Filters =====
  const [search, setSearch] = useState("");
  const [categorie, setCategorie] = useState("");
  const [indienerNaam, setIndienerNaam] = useState("");
  const [indienerFractie, setIndienerFractie] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // ===== Helpers =====
  const getCategorieArray = (cat: any) => {
    if (!cat) return [];
    return Array.isArray(cat) ? cat : [cat];
  };

  const geldigeIndieners = (indieners: any[] = []) =>
    indieners.filter((i) => i.naam !== "TK");

  // ===== FILTER FUNCTION =====
  const filterData = ({
    useSearch = true,
    useCategorie = true,
    useNaam = true,
    useFractie = true,
    useDate = true,
  }) => {
    return mockAmendments.filter((a) => {
      const matchDatum =
        !useDate ||
        ((!dateFrom || new Date(a.stemDatum) >= new Date(dateFrom)) &&
          (!dateTo || new Date(a.stemDatum) <= new Date(dateTo)));

      const matchIndiener =
        !useNaam ||
        !indienerNaam ||
        geldigeIndieners(a.indieners).some(
          (i) => i.naam === indienerNaam
        );

      const matchFractie =
        !useFractie ||
        !indienerFractie ||
        geldigeIndieners(a.indieners).some(
          (i) => i.fractie === indienerFractie
        );

      const matchTerm =
        !useSearch ||
        !search ||
        a.title.toLowerCase().includes(search.toLowerCase());

      const matchCategorie =
        !useCategorie ||
        !categorie ||
        getCategorieArray(a.Categorie).some((c) =>
          c.toLowerCase().includes(categorie.toLowerCase())
        );

      return (
        matchDatum &&
        matchIndiener &&
        matchFractie &&
        matchTerm &&
        matchCategorie
      );
    });
  };

  // ===== DROPDOWN DATA =====
  const categorieData = filterData({ useCategorie: false });

  const uniekeCategorieen = Array.from(
    new Set(
      categorieData.flatMap((a) =>
        getCategorieArray(a.Categorie)
      )
    )
  );

  const indienerData = filterData({ useNaam: false });

  const uniekeIndieners = Array.from(
    new Set(
      indienerData.flatMap((a) =>
        geldigeIndieners(a.indieners).map((i) => i.naam)
      )
    )
  );

  const fractieData = filterData({ useFractie: false });

  const uniekeFracties = Array.from(
    new Set(
      fractieData.flatMap((a) =>
        geldigeIndieners(a.indieners)
          .map((i) => i.fractie)
          .filter(Boolean)
      )
    )
  );

  // ===== MAIN FILTER =====
  const filteredAmendments = useMemo(() => {
    return filterData({});
  }, [
    search,
    categorie,
    indienerNaam,
    indienerFractie,
    dateFrom,
    dateTo,
  ]);

  const handleStartVoting = () => {
    navigate("/voting", { state: { amendments: filteredAmendments } });
  };

  const inputClass =
    "w-full mt-1 bg-white/20 border border-white/30 rounded-lg h-9 px-3 text-sm text-white";

  return (
    <Layout>
      {/* Halve cirkel */}
      <div className="fixed top-0 left-0 w-full flex justify-center z-0 pointer-events-none">
        <div className="w-full max-w-3xl">
          <KamerHalveCirkel
            parties={partiesWithVotes}
            amendmentId="welcome"
            chamberLayout={chamberLayout}
            scale={0.75}
          />
        </div>
      </div>

      <div className="relative flex flex-col items-center w-full px-4 pb-32 space-y-6">
        <GlassCard className="w-full p-6 -mt-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <label className="text-sm text-white/70">Zoekterm</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`${inputClass} placeholder-white/50`}
                placeholder="Zoek in titel"
              />
            </div>

            <div>
              <label className="text-sm text-white/70">Categorie</label>
              <select
                value={categorie}
                onChange={(e) => setCategorie(e.target.value)}
                className={inputClass}
              >
                <option value="">Alle categorieën</option>
                {uniekeCategorieen.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-white/70">Indiener</label>
              <select
                value={indienerNaam}
                onChange={(e) => setIndienerNaam(e.target.value)}
                className={inputClass}
              >
                <option value="">Alle indieners</option>
                {uniekeIndieners.map((naam) => (
                  <option key={naam} value={naam}>
                    {naam}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-white/70">Fractie</label>
              <select
                value={indienerFractie}
                onChange={(e) => setIndienerFractie(e.target.value)}
                className={inputClass}
              >
                <option value="">Alle fracties</option>
                {uniekeFracties.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-white/70">Datum van</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className="text-sm text-white/70">Datum tot</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <p className="text-white/70">
            {filteredAmendments.length} moties gevonden
          </p>
        </GlassCard>
      </div>

      <StickyBar>
        <div className="w-full max-w-md mx-auto px-4 flex justify-center">
          <button
            className="w-auto px-4 py-2 text-sm bg-blue-500 rounded-lg text-white hover:bg-blue-600 transition-colors"
            onClick={handleStartVoting}
          >
            Stem op de moties
          </button>
        </div>
      </StickyBar>
    </Layout>
  );
}
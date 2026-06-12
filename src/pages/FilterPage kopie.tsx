// src/pages/FilterPage.tsx
"use client";

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import GlassCard from "../components/GlassCard";
import StickyBar from "../components/StickyBar";
import { mockAmendments } from "../lib/mockData";

export default function FilterPage() {
  const navigate = useNavigate();

  // Filter states
  const [search, setSearch] = useState("");
  const [categorie, setCategorie] = useState("");
  const [indienerNaam, setIndienerNaam] = useState("");
  const [indienerFractie, setIndienerFractie] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Unieke waarden
  const uniekeCategorieen = Array.from(
    new Set(mockAmendments.flatMap(a => a.Categorie || []))
  );

  const uniekeFracties = Array.from(
    new Set(mockAmendments.flatMap(a => a.indieners.map(i => i.fractie)))
  );

  const uniekeIndieners = Array.from(
    new Set(mockAmendments.flatMap(a => a.indieners.map(i => i.naam)))
  );

  // Filtering
  const filteredAmendments = useMemo(() => {
    return mockAmendments.filter(a => {
      const matchDatum =
        (!dateFrom || new Date(a.stemDatum) >= new Date(dateFrom)) &&
        (!dateTo || new Date(a.stemDatum) <= new Date(dateTo));

      const matchIndiener =
        !indienerNaam ||
        a.indieners.some(i => i.naam.toLowerCase() === indienerNaam.toLowerCase());

      const matchFractie =
        !indienerFractie ||
        a.indieners.some(i => i.fractie.toLowerCase() === indienerFractie.toLowerCase());

      const matchTerm =
        !search || a.title.toLowerCase().includes(search.toLowerCase());

      const matchCategorie =
        !categorie ||
        (a.Categorie &&
          a.Categorie.some(c =>
            c.toLowerCase().includes(categorie.toLowerCase())
          ));

      return (
        matchDatum &&
        matchIndiener &&
        matchFractie &&
        matchTerm &&
        matchCategorie
      );
    });
  }, [search, categorie, indienerNaam, indienerFractie, dateFrom, dateTo]);

  const handleStartVoting = () => {
    navigate("/voting", { state: { amendments: filteredAmendments } });
  };

  // Gelijke input hoogte
  const inputClass =
    "w-full mt-1 bg-white/20 border border-white/30 rounded-lg h-9 px-3 text-sm text-white";

  return (
    <Layout>
      <div className="relative flex flex-col items-center w-full px-4 pb-32 space-y-6">
        <GlassCard className="w-full p-6 -mt-2 space-y-4">
          {/* 2 kolommen */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Zoekterm */}
            <div>
              <label className="text-sm text-white/70">Zoekterm</label>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className={`${inputClass} placeholder-white/50`}
                placeholder="Zoek in titel"
              />
            </div>

            {/* Categorie */}
            <div>
              <label className="text-sm text-white/70">Categorie</label>
              <select
                value={categorie}
                onChange={e => setCategorie(e.target.value)}
                className={inputClass}
              >
                <option value="">Alle categorieën</option>
                {uniekeCategorieen.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Indiener */}
            <div>
              <label className="text-sm text-white/70">Indiener</label>
              <select
                value={indienerNaam}
                onChange={e => setIndienerNaam(e.target.value)}
                className={inputClass}
              >
                <option value="">Alle indieners</option>
                {uniekeIndieners.map(naam => (
                  <option key={naam} value={naam}>{naam}</option>
                ))}
              </select>
            </div>

            {/* Fractie */}
            <div>
              <label className="text-sm text-white/70">Fractie</label>
              <select
                value={indienerFractie}
                onChange={e => setIndienerFractie(e.target.value)}
                className={inputClass}
              >
                <option value="">Alle fracties</option>
                {uniekeFracties.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            {/* Datum van */}
            <div>
              <label className="text-sm text-white/70">Datum van</label>
              <input
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                className={inputClass}
              />
            </div>

            {/* Datum tot */}
            <div>
              <label className="text-sm text-white/70">Datum tot</label>
              <input
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
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
        <div className="w-full max-w-md mx-auto px-4  flex justify-center">
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

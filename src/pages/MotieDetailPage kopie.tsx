// src/pages/MotieDetailPage.tsx
"use client";

import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "../components/Layout";
import GlassCard from "../components/GlassCard";
import StickyBar from "../components/StickyBar";
import { mockParties } from "../lib/mockData";
import type { VoteSubmission, Amendment } from "../types";

export default function MotieDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as { amendments?: Amendment[]; userVotes?: VoteSubmission[] } | undefined;
  const amendments: Amendment[] = state?.amendments ?? [
    { id: 1, title: "Voorbeeld Motie", description: "Dit is een voorbeeldbeschrijving.", indieners: [], Categorie: [], stemDatum: "2026-02-18" }
  ];
  const userVotes: VoteSubmission[] = state?.userVotes ?? [
    { amendmentId: 1, vote: "voor" }
  ];

  const [index, setIndex] = useState(0);
  const current = amendments[index];

  if (!current) return <Layout>Geen moties beschikbaar</Layout>;

  const userVote = userVotes.find(v => v.amendmentId === current.id)?.vote ?? "-";
  const isFirst = index === 0;
  const isLast = index === amendments.length - 1;

  function getMajorityVote(v: { voor: number; tegen: number; onthouden: number }) {
    if (v.voor >= v.tegen && v.voor >= v.onthouden) return "voor";
    if (v.tegen >= v.voor && v.tegen >= v.onthouden) return "tegen";
    return "onthouden";
  }

  return (
    <Layout>
      {/* Verticale stack wrapper */}
      <div className="relative flex flex-col items-center w-full px-4 pb-32 space-y-6">
        {/* Motie info GlassCard */}
        <GlassCard className="w-full p-6 -mt-2 space-y-4">
          <h1 className="text-3xl font-bold text-white">Motie Details</h1>
          <h2 className="text-xl font-semibold text-white">{current.title}</h2>
          <p className="text-white/80 leading-relaxed">{current.description}</p>
          <p className="font-medium text-white">Jouw stem: {userVote}</p>
        </GlassCard>

        {/* Partijuitslagen GlassCards */}
        {mockParties.map(party => {
          const partyVote = party.votes[current.id];
          const majority = partyVote ? getMajorityVote(partyVote) : "-";

          return (
            <GlassCard key={party.id} className="w-full p-4 flex justify-between items-center">
              <span className="font-medium text-white">{party.name}</span>
              {/* Halve cirkel placeholder */}
              <div
                className="w-10 h-5 border-t-4 border-l-4 border-r-4 border-green-500 rounded-t-full"
                title={majority}
              ></div>
            </GlassCard>
          );
        })}
      </div>

      {/* 🔥 Compacte StickyBar */}
     <StickyBar>
  <div className="w-full max-w-md mx-auto px-4 flex items-center gap-2">
    
    {/* Terug - aparte stijl */}
    <button
      className="px-4 py-2 text-sm rounded-lg bg-gray-500 text-white"
      onClick={() =>
        navigate("/result", { state: { amendments, userVotes } })
      }
    >
      ← Terug
    </button>

    {/* Spacer */}
    <div className="flex-1" />

    {/* Vorige */}
    <button
      className="px-4 py-2 text-sm rounded-lg bg-blue-500 text-white disabled:opacity-50"
      disabled={isFirst}
      onClick={() => setIndex(i => Math.max(0, i - 1))}
    >
      Vorige
    </button>

    {/* Volgende */}
    <button
      className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white disabled:opacity-50"
      disabled={isLast}
      onClick={() =>
        setIndex(i => Math.min(amendments.length - 1, i + 1))
      }
    >
      Volgende →
    </button>
  </div>
</StickyBar>
    </Layout>
  );
}
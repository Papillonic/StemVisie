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

  const state = location.state as {
    amendments?: Amendment[];
    userVotes?: VoteSubmission[];
  } | undefined;

  const amendments: Amendment[] =
    state?.amendments ?? [
      {
        id: "1",
        title: "Voorbeeld Motie",
        description: "Dit is een voorbeeldbeschrijving.",
        indieners: [],
        Categorie: [],
        stemDatum: "2026-02-18",
      },
    ];

  const userVotes: VoteSubmission[] =
    state?.userVotes ?? [{ amendmentId: "1", vote: "voor" }];

  const [index, setIndex] = useState(0);
  const current = amendments[index];

  if (!current) return <Layout>Geen moties beschikbaar</Layout>;

  const userVote =
    userVotes.find((v) => v.amendmentId === current.id)?.vote ?? "-";

  const isFirst = index === 0;
  const isLast = index === amendments.length - 1;

  function getMajorityVote(v: { voor: number; tegen: number; onthouden: number }) {
    if (v.voor >= v.tegen && v.voor >= v.onthouden) return "voor";
    if (v.tegen >= v.voor && v.tegen >= v.onthouden) return "tegen";
    return "onthouden";
  }

  return (
    <Layout>
      <div className="flex justify-center px-4 pb-32">
        {/* ÉÉN GLASSCARD */}
        <GlassCard className="w-full max-w-xl p-4 space-y-4">

          {/* Partijen bovenaan in 3 kolommen */}
          <div className="grid grid-cols-3 gap-2 text-xs text-white">
            {mockParties.map((party) => {
              const partyVote = party.votes[current.id];
              const seats = partyVote
                ? partyVote.voor + partyVote.tegen + partyVote.onthouden
                : 0;
              const majority = partyVote ? getMajorityVote(partyVote) : "-";

              // kleur van bolletje
              const color =
                majority === "voor"
                  ? "bg-green-500"
                  : majority === "tegen"
                  ? "bg-red-500"
                  : "bg-yellow-400";

              return (
                <div
                  key={party.id}
                  className="flex justify-between items-center p-1 bg-white/10 rounded"
                >
                  <span className="font-semibold">{party.abbreviation ?? party.name}</span>
                  <span className="text-white/70 text-[10px]">{seats} zetels</span>
                  <span
                    className={`w-3 h-3 rounded-full ${color}`}
                    title={majority}
                  ></span>
                </div>
              );
            })}
          </div>

          {/* Divider */}
          <div className="border-t border-white/10"></div>

          {/* Motie info onderaan */}
          <div className="mt-2">
            <h2 className="text-lg font-semibold text-white">{current.title}</h2>
            <p className="text-white/70 text-sm mt-1 line-clamp-3">
              {current.description}
            </p>
            <p className="text-sm text-white/80 mt-1">
              Jouw stem: <span className="font-medium">{userVote}</span>
            </p>
          </div>

        </GlassCard>
      </div>

      {/* Sticky navigation onderaan */}
      <StickyBar>
        <div className="w-full max-w-xl mx-auto px-4 flex items-center gap-2">

          <button
            className="px-4 py-2 text-sm rounded-lg bg-gray-500 text-white"
            onClick={() =>
              navigate("/result", { state: { amendments, userVotes } })
            }
          >
            ← Terug
          </button>

          <div className="flex-1" />

          <button
            className="px-4 py-2 text-sm rounded-lg bg-blue-500 text-white disabled:opacity-50"
            disabled={isFirst}
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
          >
            Vorige
          </button>

          <button
            className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white disabled:opacity-50"
            disabled={isLast}
            onClick={() =>
              setIndex((i) => Math.min(amendments.length - 1, i + 1))
            }
          >
            Volgende →
          </button>

        </div>
      </StickyBar>
    </Layout>
  );
}
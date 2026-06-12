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

  /* totaal stemmen berekenen voor motie */
  const totalVotes = mockParties
    .map((p) => p.votes[current.id])
    .filter(Boolean)
    .reduce(
      (acc, v) => ({
        voor: acc.voor + (v?.voor ?? 0),
        tegen: acc.tegen + (v?.tegen ?? 0),
        onthouden: acc.onthouden + (v?.onthouden ?? 0),
      }),
      { voor: 0, tegen: 0, onthouden: 0 }
    );

  const motionResult =
    totalVotes.voor >= totalVotes.tegen && totalVotes.voor >= totalVotes.onthouden
      ? "voor"
      : totalVotes.tegen >= totalVotes.voor &&
        totalVotes.tegen >= totalVotes.onthouden
      ? "tegen"
      : "onthouden";

  const resultColor =
    motionResult === "voor"
      ? "text-green-400"
      : motionResult === "tegen"
      ? "text-red-400"
      : "text-yellow-400";

  const resultText =
    motionResult === "voor"
      ? "Motie aangenomen"
      : motionResult === "tegen"
      ? "Motie afgewezen"
      : "Motie onthouden";

  return (
    <Layout>
      <div className="flex justify-center px-4 pb-32">
        <GlassCard className="w-full max-w-xl p-4 space-y-4">

          {/* PARTIJEN GRID */}
          <div className="grid grid-cols-3 gap-2 text-xs text-white">
            {mockParties
              .map((party) => {
                const partyVote = party.votes[current.id];

                const seats = partyVote
                  ? partyVote.voor + partyVote.tegen + partyVote.onthouden
                  : 0;

                const majority = partyVote
                  ? getMajorityVote(partyVote)
                  : "-";

                const color =
                  majority === "voor"
                    ? "bg-green-500"
                    : majority === "tegen"
                    ? "bg-red-500"
                    : "bg-yellow-400";

                return { ...party, seats, majority, color };
              })
              .sort((a, b) => b.seats - a.seats)
              .map((party) => (
                <div
                  key={party.id}
                  className="flex justify-between items-center p-1 bg-white/10 rounded"
                >
                  <div className="flex items-center gap-1">
                    <img
                      src={`/party-logos/${party.abbreviation?.toLowerCase()}.svg`}
                      alt={party.name}
                      className="w-5 h-5 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "/party-logos/placeholder.png";
                      }}
                    />
                    <span className="font-semibold text-[11px]">
                      {party.name}
                    </span>
                  </div>

                  <span className="text-white/70 text-[10px]">
                    {party.seats}
                  </span>

                  <span
                    className={`w-3 h-3 rounded-full ${party.color}`}
                    title={party.majority}
                  ></span>
                </div>
              ))}
          </div>

          <div className="border-t border-white/10"></div>

          {/* MOTIE STATUS */}
          <p className={`text-sm font-semibold ${resultColor}`}>
            {resultText} | Jouw stem: {userVote}
          </p>

          {/* MOTIE TEKST */}
          <div>
            <h2 className="text-lg font-semibold text-white">
              {current.title}
            </h2>

            <p className="text-white/70 text-sm mt-1">
              {current.description}
            </p>
          </div>

        </GlassCard>
      </div>

      {/* NAVIGATIE */}
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
            disabled={index === 0}
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
          >
            Vorige
          </button>

          <button
            className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white disabled:opacity-50"
            disabled={index === amendments.length - 1}
            onClick={() =>
              setIndex((i) =>
                Math.min(amendments.length - 1, i + 1)
              )
            }
          >
            Volgende →
          </button>

        </div>
      </StickyBar>
    </Layout>
  );
}
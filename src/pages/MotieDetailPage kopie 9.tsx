"use client";

import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "../components/Layout";
import GlassCard from "../components/GlassCard";
import StickyBar from "../components/StickyBar";
import KamerHalveCirkel from "../components/KamerHalveCirkel";
import { mockParties } from "../lib/mockData";
import { PARTY_HOUSE_STYLES } from "../lib/partyHouseStyles";
import type { VoteSubmission, Amendment } from "../types";
import {
  kamerLayoutNov2023_Nov2025,
  kamerLayoutVanafFeb2026,
} from "../lib/kamerLayouts";

export default function MotieDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as
    | {
        amendments?: Amendment[];
        userVotes?: VoteSubmission[];
      }
    | undefined;

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

  const stemDatum = new Date(current.stemDatum);

  const chamberLayout =
    stemDatum >= new Date(kamerLayoutVanafFeb2026.startDate)
      ? kamerLayoutVanafFeb2026
      : kamerLayoutNov2023_Nov2025;

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
    totalVotes.voor >= totalVotes.tegen &&
    totalVotes.voor >= totalVotes.onthouden
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

  const isFirst = index === 0;
  const isLast = index === amendments.length - 1;

  function getMajorityVote(v: {
    voor: number;
    tegen: number;
    onthouden: number;
  }) {
    if (v.voor >= v.tegen && v.voor >= v.onthouden) return "voor";
    if (v.tegen >= v.voor && v.tegen >= v.onthouden) return "tegen";
    return "onthouden";
  }

  return (
    <Layout>
      <div className="fixed top-0 left-0 w-full flex justify-center z-0 pointer-events-none">
        <div className="w-full max-w-3xl">
          <KamerHalveCirkel
            parties={mockParties}
            amendmentId={current.id}
            chamberLayout={chamberLayout}
          />
        </div>
      </div>

      <div className="relative flex flex-col items-center w-full px-4 pb-32">

        <GlassCard className="w-full max-w-4xl h-[400px] overflow-hidden p-4 flex flex-col">

          <div className="flex items-center justify-between text-sm mb-4">
            <div className={`font-bold ${resultColor}`}>
              {resultText}
            </div>

            <div className="text-white text-center font-bold">
              {totalVotes.voor} voor · {totalVotes.tegen} tegen
              {totalVotes.onthouden > 0 &&
                ` · ${totalVotes.onthouden} onthouden`}
            </div>

            <div className="flex items-center gap-1 text-white">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  userVote === "voor"
                    ? "bg-green-400"
                    : userVote === "tegen"
                    ? "bg-red-400"
                    : "bg-yellow-400"
                }`}
              />
              <span className="text-xs font-bold">
                Jouw stem: {userVote}
              </span>
            </div>
          </div>

          <div className="border-t border-white/20 mb-4"></div>

          <div className="flex-1 overflow-y-auto pr-1 space-y-4">

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 text-xs text-white font-bold">
              {mockParties
                .map((party) => {
                  const partyVote = party.votes[current.id];

                  const seats = partyVote
                    ? partyVote.voor +
                      partyVote.tegen +
                      partyVote.onthouden
                    : 0;

                  const majority = partyVote
                    ? getMajorityVote(partyVote)
                    : "-";

                  const voteColor =
                    majority === "voor"
                      ? "bg-green-500"
                      : majority === "tegen"
                      ? "bg-red-500"
                      : "bg-yellow-400";

                  const backgroundColor =
                    PARTY_HOUSE_STYLES[
                      party.abbreviation as keyof typeof PARTY_HOUSE_STYLES
                    ] ?? "#444";

                  return {
                    ...party,
                    seats,
                    majority,
                    voteColor,
                    backgroundColor,
                  };
                })
                .sort((a, b) => b.seats - a.seats)
                .map((party) => (
                  <div
                    key={party.id}
                    className="flex justify-between items-center p-2 rounded text-white font-bold"
                    style={{ backgroundColor: party.backgroundColor }}
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={`/party-logos/${party.abbreviation?.toLowerCase()}.svg`}
                        alt={party.name}
                        className="w-5 h-5 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/party-logos/placeholder.png";
                        }}
                      />

                      <span className="text-[11px] font-bold">
                        {party.name}
                      </span>
                    </div>

                    <span className="text-[10px] font-bold">
                      {party.seats}
                    </span>

                    <span
                      className={`w-3 h-3 rounded-full ${party.voteColor}`}
                      title={party.majority}
                    />
                  </div>
                ))}
            </div>

            <div className="border-t border-white/20"></div>

            <div>
              <h2 className="text-lg font-semibold text-white">
                {current.title}
              </h2>

              <p className="text-white text-sm mt-1 leading-relaxed font-bold">
                {current.description}
              </p>
            </div>

          </div>
        </GlassCard>
      </div>

      <StickyBar>
        <div className="w-full max-w-xl mx-auto px-4 flex items-center gap-2">
          <button
            className="px-4 py-2 text-sm rounded-lg bg-gray-500 text-white"
            onClick={() =>
              navigate("/result", {
                state: { amendments, userVotes },
              })
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
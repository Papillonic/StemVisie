// src/pages/VotingPage.tsx
"use client";

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "../components/Layout";
import GlassCard from "../components/GlassCard";
import StickyBar from "../components/StickyBar";
import type { Amendment, Vote, VoteSubmission } from "../types";
import KamerHalveCirkel from "../components/KamerHalveCirkelWelcomeReal";
import {
  kamerLayoutNov2023_Nov2025,
  kamerLayoutVanafFeb2026,
} from "../lib/kamerLayouts";

import { mockParties } from "../lib/mockData";

export default function VotingPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const amendments: Amendment[] = location.state?.amendments ?? [];
  const [index, setIndex] = useState(0);
  const [userVotes, setUserVotes] = useState<VoteSubmission[]>([]);
  const [textMode, setTextMode] = useState<"simple" | "short" | "full">("short");
  const [flash, setFlash] = useState(false);

  const current = amendments[index];
  if (!current) return <Layout>Geen moties geselecteerd</Layout>;

  const total = amendments.length;
  const isLast = index === total - 1;

  const selectedVote =
    userVotes.find(v => v.amendmentId === current.id)?.vote ?? null;

  let descriptionText = current.description;

  if (textMode === "full") {
    descriptionText = current.fullDescription ?? current.description;
  }

  if (textMode === "short") {
    descriptionText = current.description;
  }

  if (textMode === "simple") {
    descriptionText = current.simplified ?? current.description;
  }

  const today = new Date();
  const chamberLayout =
    today >= new Date(kamerLayoutVanafFeb2026.startDate)
      ? kamerLayoutVanafFeb2026
      : kamerLayoutNov2023_Nov2025;

  const partyAbbreviations = [
    ...new Set(chamberLayout.seats.map((s) => s.partyAbbreviation)),
  ];

  const generateRandomParties = () =>
    partyAbbreviations.map((abbr) => {
      const random = Math.random();

      const party = mockParties.find(
        (p) => p.abbreviation === abbr
      );

      let voor = 0;
      let tegen = 0;
      let onthouden = 0;

      if (random < 0.5) voor = 1;
      else tegen = 1;

      return {
        id: abbr,
        name: party?.name ?? abbr,
        abbreviation: abbr,
        votes: {
          welcome: { voor, tegen, onthouden },
        },
      };
    });

  const [partiesWithVotes, setPartiesWithVotes] =
    useState(generateRandomParties());

  useEffect(() => {
    const interval = setInterval(() => {
      setPartiesWithVotes(generateRandomParties());
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const handleVote = (vote: Vote) => {
    setUserVotes(prev => [
      ...prev.filter(v => v.amendmentId !== current.id),
      { amendmentId: current.id, vote },
    ]);

    if (isLast) {
      setFlash(true);
      setTimeout(() => setFlash(false), 500);
    }

    setTimeout(() => {
      setIndex(i => (i < total - 1 ? i + 1 : i));
    }, 250);
  };

  const buttonWidth = "120px";
  const navButtonWidth = "150px";

  return (
    <Layout>
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

      <div className="relative flex flex-col items-center w-full px-4 pb-32">
        <GlassCard className="w-full p-6 -mt-2 space-y-4 h-[400px] flex flex-col">

          {/* ✅ TOP BAR: LINKS MODE + RECHTS COUNTER */}
          <div className="flex justify-between items-center">

            {/* LINKS: MODE SWITCHER (BOLD) */}
            <div className="flex gap-2">
              <button
                className={`px-3 py-1 rounded font-bold transition-colors duration-200 ${
                  textMode === "full"
                    ? "bg-white text-black shadow-md"
                    : "bg-white/20 text-white/80 hover:bg-white/30"
                }`}
                onClick={() => setTextMode("full")}
              >
                Origineel
              </button>

              <button
                className={`px-3 py-1 rounded font-bold transition-colors duration-200 ${
                  textMode === "short"
                    ? "bg-white text-black shadow-md"
                    : "bg-white/20 text-white/80 hover:bg-white/30"
                }`}
                onClick={() => setTextMode("short")}
              >
                Kern
              </button>

              <button
                className={`px-3 py-1 rounded font-bold transition-colors duration-200 ${
                  textMode === "simple"
                    ? "bg-white text-black shadow-md"
                    : "bg-white/20 text-white/80 hover:bg-white/30"
                }`}
                onClick={() => setTextMode("simple")}
              >
                Versimpeld
              </button>
            </div>

            {/* RECHTS: COUNTER */}
            <p className="text-white font-bold text-sm">
              Motie {index + 1} van {total}
            </p>

          </div>

          {/* TITLE */}
          <h2 className="text-xl font-semibold text-white leading-snug">
            {current.title}
          </h2>

          {/* DESCRIPTION */}
          <div className="overflow-y-auto flex-1 min-h-0 pr-1 text-white font-bold leading-relaxed whitespace-pre-line">
            {descriptionText}
          </div>

        </GlassCard>
      </div>

      <StickyBar>
        <div className="w-full max-w-2xl flex justify-center items-center gap-4 px-2">

          <button
            disabled={index === 0}
            style={{ width: navButtonWidth, marginRight: "50px" }}
            className="py-2 text-sm rounded-lg bg-blue-600 text-white disabled:opacity-50"
            onClick={() => setIndex(i => Math.max(0, i - 1))}
          >
            Vorige
          </button>

          <div className="flex justify-center gap-2">
            {["voor", "tegen", "onthouden"].map(v => {
              const icon = v === "voor" ? "✅" : v === "tegen" ? "❌" : "🤷‍♂️";

              const previewStyles =
                v === "voor"
                  ? "bg-green-300 border border-green-500 text-green-950 hover:bg-green-400"
                  : v === "tegen"
                  ? "bg-red-300 border border-red-500 text-red-950 hover:bg-red-400"
                  : "bg-gray-300 border border-gray-500 text-gray-900 hover:bg-gray-400";

              const selectedStyles =
                v === "voor"
                  ? "bg-green-600 border-green-700 text-white shadow-md"
                  : v === "tegen"
                  ? "bg-red-600 border-red-700 text-white shadow-md"
                  : "bg-gray-600 border-gray-700 text-white shadow-md";

              return (
                <button
                  key={v}
                  style={{ width: buttonWidth }}
                  className={`py-2 text-sm rounded-lg font-semibold flex justify-center items-center gap-1 transition-colors duration-200 ${
                    selectedVote === v ? selectedStyles : previewStyles
                  }`}
                  onClick={() => handleVote(v as Vote)}
                >
                  <span>{icon}</span>
                  <span>{v.charAt(0).toUpperCase() + v.slice(1)}</span>
                </button>
              );
            })}
          </div>

          {!isLast ? (
            <button
              style={{ width: navButtonWidth, marginLeft: "50px" }}
              className="py-2 text-sm rounded-lg bg-blue-600 text-white"
              onClick={() => setIndex(i => Math.min(total - 1, i + 1))}
            >
              Volgende
            </button>
          ) : (
            <button
              style={{ width: navButtonWidth, marginLeft: "50px" }}
              className={`py-2 text-sm rounded-lg bg-blue-600 text-white font-semibold transition-all duration-200 ${
                flash ? "scale-110" : ""
              }`}
              onClick={() => navigate("/result", { state: { userVotes, amendments } })}
            >
              Afronden
            </button>
          )}

        </div>
      </StickyBar>
    </Layout>
  );
}
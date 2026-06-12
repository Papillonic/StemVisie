// src/pages/VotingPage.tsx
"use client";

import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "../components/Layout";
import GlassCard from "../components/GlassCard";
import StickyBar from "../components/StickyBar";
import type { Amendment, Vote, VoteSubmission } from "../types";

export default function VotingPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const amendments: Amendment[] = location.state?.amendments ?? [];
  const [index, setIndex] = useState(0);
  const [userVotes, setUserVotes] = useState<VoteSubmission[]>([]);
  const [textMode, setTextMode] = useState<"simple" | "short" | "full">("short");
  const [flash, setFlash] = useState(false); // voor afronden-knop knipperen

  const current = amendments[index];
  if (!current) return <Layout>Geen moties geselecteerd</Layout>;

  const total = amendments.length;
  const isLast = index === total - 1;

  const selectedVote =
    userVotes.find(v => v.amendmentId === current.id)?.vote ?? null;

  // Stem handler met korte delay voor visual feedback
  const handleVote = (vote: Vote) => {
    setUserVotes(prev => [
      ...prev.filter(v => v.amendmentId !== current.id),
      { amendmentId: current.id, vote },
    ]);

    // Als laatste motie, trigger flash voor afronden
    if (isLast) {
      setFlash(true);
      setTimeout(() => setFlash(false), 500);
    }

    setTimeout(() => {
      setIndex(i => (i < total - 1 ? i + 1 : i));
    }, 250);
  };

  // Breedtes knoppen
  const buttonWidth = "120px"; // Voor/Tegen/Onthouden
  const navButtonWidth = "150px"; // Vorige / Volgende / Afronden

  // Kies juiste tekst op basis van textMode
  let descriptionText = current.description;
  if (textMode === "full") descriptionText = current.fullDescription ?? current.description;
  if (textMode === "simple") descriptionText = current.simplified ?? current.description;

  return (
    <Layout>
      <div className="relative flex flex-col items-center w-full px-4 pb-32">
        <GlassCard className="w-full p-6 -mt-2 space-y-4 max-h-[420px] flex flex-col">

          {/* Flex container voor tekstmodus-knoppen links en teller rechts */}
          <div className="flex items-center">
            <div className="flex gap-2">
              {/* Tekstmodus-knoppen met kleuren en emoji */}
              <button
                className={`px-3 py-1 rounded font-medium flex items-center gap-1 transition-colors duration-200 ${
                  textMode === "simple"
                    ? "bg-green-500 text-white shadow-md"
                    : "bg-green-200 text-green-900 hover:bg-green-300"
                }`}
                onClick={() => setTextMode("simple")}
              >
                🟢 Simpel
              </button>
              <button
                className={`px-3 py-1 rounded font-medium flex items-center gap-1 transition-colors duration-200 ${
                  textMode === "short"
                    ? "bg-yellow-500 text-white shadow-md"
                    : "bg-yellow-200 text-yellow-900 hover:bg-yellow-300"
                }`}
                onClick={() => setTextMode("short")}
              >
                🟡 Kort
              </button>
              <button
                className={`px-3 py-1 rounded font-medium flex items-center gap-1 transition-colors duration-200 ${
                  textMode === "full"
                    ? "bg-blue-500 text-white shadow-md"
                    : "bg-blue-200 text-blue-900 hover:bg-blue-300"
                }`}
                onClick={() => setTextMode("full")}
              >
                🔵 Volledig
              </button>
            </div>

            <p className="ml-auto text-white/60 text-sm">
              Motie {index + 1} van {total}
            </p>
          </div>

          {/* Titel iets kleiner en subtieler */}
          <h2 className="text-lg font-medium text-white">{current.title}</h2>

          {/* Scrollbare tekstcontainer met alinea’s zichtbaar */}
          <div className="overflow-y-auto flex-1 min-h-0 pr-1 text-white/80 leading-relaxed whitespace-pre-line">
            {descriptionText}
          </div>
        </GlassCard>
      </div>

      <StickyBar>
        <div className="w-full max-w-2xl flex justify-center items-center gap-4 px-2">
          {/* Vorige knop */}
          <button
            disabled={index === 0}
            style={{ width: navButtonWidth, marginRight: "50px" }}
            className="py-2 text-sm rounded-lg bg-blue-500 text-white disabled:opacity-50"
            onClick={() => setIndex(i => Math.max(0, i - 1))}
          >
            Vorige
          </button>

          {/* Stemknoppen met emoji en originele kleuren */}
          <div className="flex justify-center gap-2">
            {["voor", "tegen", "onthouden"].map(v => {
              const icon = v === "voor" ? "✅" : v === "tegen" ? "❌" : "🤷‍♂️";

              const previewStyles =
                v === "voor"
                  ? "bg-green-200 border border-green-400 text-green-900 hover:bg-green-300"
                  : v === "tegen"
                  ? "bg-red-200 border border-red-400 text-red-900 hover:bg-red-300"
                  : "bg-yellow-200 border border-yellow-400 text-yellow-900 hover:bg-yellow-300";

              const selectedStyles =
                v === "voor"
                  ? "bg-green-500 border-green-600 text-white shadow-md"
                  : v === "tegen"
                  ? "bg-red-500 border-red-600 text-white shadow-md"
                  : "bg-yellow-500 border-yellow-600 text-white shadow-md";

              return (
                <button
                  key={v}
                  style={{ width: buttonWidth }}
                  className={`py-2 text-sm rounded-lg font-medium flex justify-center items-center gap-1 transition-colors duration-200 ${
                    selectedVote === v ? selectedStyles : previewStyles
                  }`}
                  onClick={() => handleVote(v as Vote)}
                >
                  <span>{icon}</span> <span>{v.charAt(0).toUpperCase() + v.slice(1)}</span>
                </button>
              );
            })}
          </div>

          {/* Volgende / Afronden knop */}
          {!isLast ? (
            <button
              style={{ width: navButtonWidth, marginLeft: "50px" }}
              className="py-2 text-sm rounded-lg bg-blue-500 text-white"
              onClick={() => setIndex(i => Math.min(total - 1, i + 1))}
            >
              Volgende
            </button>
          ) : (
            <button
              style={{ width: navButtonWidth, marginLeft: "50px" }}
              className={`py-2 text-sm rounded-lg bg-blue-500 text-white font-semibold transition-all duration-200 ${
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
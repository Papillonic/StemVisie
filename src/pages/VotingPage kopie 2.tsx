// src/pages/VotingPage.tsx
"use client";

import { useState, useEffect } from "react";
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
      setTextMode("short"); // reset tekstmodus bij nieuwe motie
    }, 250);
  };

  // 👇 Hier kun je breedtes makkelijk aanpassen
  const buttonWidth = "80px"; // Voor/Tegen/Onthouden
  const navButtonWidth = "100px"; // Vorige / Volgende / Afronden

  // Kies juiste tekst op basis van textMode
  let descriptionText = current.description;
  if (textMode === "full") descriptionText = current.fullDescription ?? current.description;
  if (textMode === "simple") descriptionText = current.simplified ?? current.description;

  return (
    <Layout>
      <div className="relative flex flex-col items-center w-full px-4 pb-32 space-y-6">
        <GlassCard className="w-full p-6 -mt-2 space-y-4">
          <h1 className="text-3xl font-bold text-white">Stemmen</h1>
          <h2 className="text-xl font-semibold text-white">{current.title}</h2>

          {/* Knoppen om tekstmodus te wisselen */}
          <div className="flex gap-2">
            <button
              className={`px-2 py-1 rounded ${
                textMode === "simple" ? "bg-gray-500 text-white" : "bg-gray-200 text-gray-800"
              }`}
              onClick={() => setTextMode("simple")}
            >
              Simpel
            </button>
            <button
              className={`px-2 py-1 rounded ${
                textMode === "short" ? "bg-gray-500 text-white" : "bg-gray-200 text-gray-800"
              }`}
              onClick={() => setTextMode("short")}
            >
              Kort
            </button>
            <button
              className={`px-2 py-1 rounded ${
                textMode === "full" ? "bg-gray-500 text-white" : "bg-gray-200 text-gray-800"
              }`}
              onClick={() => setTextMode("full")}
            >
              Volledig
            </button>
          </div>

     {/* Scrollable tekstcontainer */}
<div className="max-h-[calc(100vh-300px)] overflow-y-auto pr-1 text-white/80 leading-relaxed">
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
            onClick={() => {
              setIndex(i => Math.max(0, i - 1));
              setTextMode("short"); // reset tekstmodus bij vorige
            }}
          >
            Vorige
          </button>

          {/* Stemknoppen */}
          <div className="flex justify-center gap-2">
            {["voor", "tegen", "onthouden"].map(v => {
              const previewStyles =
                v === "voor"
                  ? "bg-green-100 border border-green-400 text-green-800"
                  : v === "tegen"
                  ? "bg-red-100 border border-red-400 text-red-800"
                  : "bg-gray-200 border border-gray-400 text-gray-700";

              const selectedStyles =
                v === "voor"
                  ? "bg-green-500 border-green-600 text-white"
                  : v === "tegen"
                  ? "bg-red-500 border-red-600 text-white"
                  : "bg-gray-500 border-gray-600 text-white";

              return (
                <button
                  key={v}
                  style={{ width: buttonWidth }}
                  className={`py-2 text-sm rounded-lg font-medium transition-colors duration-200 ${
                    selectedVote === v ? selectedStyles : previewStyles
                  }`}
                  onClick={() => handleVote(v as Vote)}
                >
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              );
            })}
          </div>

          {/* Volgende / Afronden knop */}
          {!isLast ? (
            <button
              style={{ width: navButtonWidth, marginLeft: "50px" }}
              className="py-2 text-sm rounded-lg bg-blue-500 text-white"
              onClick={() => {
                setIndex(i => Math.min(total - 1, i + 1));
                setTextMode("short");
              }}
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
// src/pages/ResultPage.tsx
"use client";

import { useLocation, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import GlassCard from "../components/GlassCard";
import StickyBar from "../components/StickyBar";
import { mockParties } from "../lib/mockData";

export default function ResultPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const amendments = location.state?.amendments ?? [];
  const userVotes = location.state?.userVotes ?? [];

  if (!amendments.length || !userVotes.length) {
    return <Layout>Geen resultaten beschikbaar</Layout>;
  }

  // Bereken match percentages
  const results = mockParties.map((party) => {
    let matches = 0;
    let total = 0;

    for (const userVote of userVotes) {
      const partyVote = party.votes[userVote.amendmentId];
      if (!partyVote) continue;

      const majority =
        partyVote.voor >= partyVote.tegen &&
        partyVote.voor >= partyVote.onthouden
          ? "voor"
          : partyVote.tegen >= partyVote.voor &&
            partyVote.tegen >= partyVote.onthouden
          ? "tegen"
          : "onthouden";

      if (userVote.vote === majority) matches++;
      total++;
    }

    return {
      name: party.name,
      logo: party.logo,
      percentage: total ? Math.round((matches / total) * 100) : 0,
    };
  });

  results.sort((a, b) => b.percentage - a.percentage);

  return (
    <Layout>
      <div className="relative flex flex-col items-center w-full px-4 pb-32">
        <GlassCard className="w-full p-6 -mt-2 space-y-4">
          {/* Titel */}
          <div>
<p className="text-white/80 text-sm text-center">
  Jouw politieke match op basis van {userVotes.length} van de {amendments.length} moties
</p>
          </div>

          {/* Scroll container */}
          <div className="max-h-[420px] overflow-y-auto pr-1">
       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
       {results.map((r) => (
                <div
                  key={r.name}
                  className="flex flex-col items-center p-4 bg-white/5 rounded-xl backdrop-blur"
                >
                  {r.logo && (
                    <img
                      src={r.logo}
                      alt={r.name}
                      className="w-14 h-14 object-contain mb-2"
                    />
                  )}

                  <span className="text-white font-medium">{r.name}</span>

                  <div className="relative w-16 h-16 mt-2">
                    <svg
                      className="w-full h-full rotate-[-90deg]"
                      viewBox="0 0 36 36"
                    >
                      <circle
                        className="text-white/20"
                        strokeWidth="4"
                        stroke="currentColor"
                        fill="transparent"
                        cx="18"
                        cy="18"
                        r="16"
                      />
                      <circle
                        className="text-blue-500"
                        strokeWidth="4"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        cx="18"
                        cy="18"
                        r="16"
                        strokeDasharray={`${r.percentage} 100`}
                      />
                    </svg>

                    <div className="absolute inset-0 flex items-center justify-center text-white text-sm font-bold">
                      {r.percentage}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* 🔥 Compacte StickyBar knoppen */}
      <StickyBar>
  <div className="w-full max-w-md mx-auto px-4 flex gap-2">
    {/* Terug naar start */}
    <button
      className="flex-1 py-2 text-sm rounded-lg bg-blue-500 text-white"
      onClick={() => navigate("/")}
    >
      Terug naar start
    </button>

    {/* Opnieuw stemmen */}
    <button
      className="flex-1 py-2 text-sm rounded-lg bg-blue-400 text-white"
      onClick={() => navigate("/filter")}
    >
      Opnieuw stemmen
    </button>

    {/* Bekijk details */}
    <button
      className="flex-1 py-2 text-sm rounded-lg bg-green-500 text-white"
      onClick={() =>
        navigate("/detail", { state: { amendments, userVotes } })
      }
    >
      Bekijk details
    </button>
  </div>
</StickyBar>
    </Layout>
  );
}
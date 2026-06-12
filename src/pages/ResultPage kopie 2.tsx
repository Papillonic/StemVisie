// src/pages/ResultPage.tsx
"use client";

import { useLocation, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import StickyBar from "../components/StickyBar";
import { mockParties } from "../lib/mockData";
import { PARTY_HOUSE_STYLES } from "../lib/partyHouseStyles";

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
        {/* Titel in één zin en kleiner */}
        <p className="text-white/80 text-sm text-center mb-4">
          Jouw politieke match op basis van {userVotes.length} van de {amendments.length} moties
        </p>

        {/* Grid van partijen */}
        <div className="max-h-[420px] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {results.map((r) => {
              const bgColor = PARTY_HOUSE_STYLES[r.name] ?? "#555";

              return (
                <div
                  key={r.name}
                  className="flex flex-col items-center p-4 rounded-xl shadow-md hover:scale-105 transition-transform duration-200"
                  style={{ backgroundColor: bgColor }}
                >
                  {/* Logo */}
                  {r.logo && (
                    <img
                      src={`/party-logos/${r.logo}`}
                      alt={r.name}
                      className="w-16 h-16 object-contain mb-2"
                    />
                  )}

                  {/* Naam */}
                  <span className="text-white font-semibold text-lg mb-2">{r.name}</span>

                  {/* Percentage */}
                  <div className="relative w-24 h-24">
                    <svg className="w-full h-full rotate-[-90deg]" viewBox="0 0 36 36">
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
                        strokeWidth="4"
                        strokeLinecap="round"
                        stroke="white"
                        fill="transparent"
                        cx="18"
                        cy="18"
                        r="16"
                        strokeDasharray={`${r.percentage} 100`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-white text-lg font-bold">
                      {r.percentage}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* StickyBar met bredere knoppen */}
      <StickyBar>
        <div className="w-full max-w-xl mx-auto px-4 flex gap-4">
          <button
            className="flex-1 min-w-[120px] py-2 text-sm rounded-lg bg-blue-500 text-white hover:bg-blue-600 shadow-md flex justify-center items-center gap-1"
            onClick={() => navigate("/")}
          >
            🏠 Terug naar start
          </button>

          <button
            className="flex-1 min-w-[120px] py-2 text-sm rounded-lg bg-blue-400 text-white hover:bg-blue-500 shadow-md flex justify-center items-center gap-1"
            onClick={() => navigate("/filter")}
          >
            🔄 Opnieuw stemmen
          </button>

          <button
            className="flex-1 min-w-[120px] py-2 text-sm rounded-lg bg-green-500 text-white hover:bg-green-600 shadow-md flex justify-center items-center gap-1"
            onClick={() =>
              navigate("/detail", { state: { amendments, userVotes } })
            }
          >
            📄 Bekijk details
          </button>
        </div>
      </StickyBar>
    </Layout>
  );
}
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
      abbreviation: party.abbreviation,
      percentage: total ? Math.round((matches / total) * 100) : 0,
    };
  });

  results.sort((a, b) => b.percentage - a.percentage);

  return (
    <Layout>
      <div className="relative flex flex-col items-center w-full px-4 pb-32">
        <p className="text-white/80 text-sm text-center mb-3">
          Jouw politieke match op basis van {userVotes.length} van de {amendments.length} moties
        </p>

        <div className="max-h-[420px] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
            {results.map((r) => {
              const bgColor =
                PARTY_HOUSE_STYLES[r.abbreviation.toUpperCase()] ?? "#555";

              return (
                <div
                  key={r.name}
                  className="flex flex-col items-center p-1.5 rounded-lg shadow-md hover:scale-105 transition-transform duration-200"
                  style={{
                    backgroundColor: bgColor,
                    minHeight: "120px",
                  }}
                >
                  {/* Logo */}
                  <div className="w-10 h-10 mb-2 rounded-full bg-white flex items-center justify-center p-0.5">
                    <img
                      src={`/party-logos/${r.abbreviation.toLowerCase()}.svg`}
                      alt={r.name}
                      className="w-8 h-8 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "/party-logos/placeholder.png";
                      }}
                    />
                  </div>

                  {/* Naam */}
                  <div className="h-6 mb-2 flex items-center justify-center text-center w-full">
                    <span className="text-white font-semibold text-sm leading-tight">
                      {r.name}
                    </span>
                  </div>

                  {/* Match-balk */}
                  <div className="w-full mt-auto">
                    <div className="bg-gray-300 rounded-full h-3 relative overflow-hidden">
                      <div
                        className="h-3 rounded-full flex items-center justify-end pr-1 text-white font-bold text-xs transition-all duration-500"
                        style={{
                          width: `${r.percentage}%`,
                          minWidth: "36px",
                          backgroundColor: `rgba(31,41,55,${
                            0.4 + r.percentage / 100
                          })`,
                        }}
                      >
                        {r.percentage}%
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <StickyBar>
        <div className="w-full max-w-xl mx-auto px-4 flex gap-2">
          <button
            className="flex-1 min-w-[100px] py-2 text-sm rounded-lg bg-blue-500 text-white hover:bg-blue-600 shadow-md flex justify-center items-center gap-1"
            onClick={() => navigate("/")}
          >
            🏠 Terug naar start
          </button>

          <button
            className="flex-1 min-w-[100px] py-2 text-sm rounded-lg bg-blue-400 text-white hover:bg-blue-500 shadow-md flex justify-center items-center gap-1"
            onClick={() => navigate("/filter")}
          >
            🔄 Opnieuw stemmen
          </button>

          <button
            className="flex-1 min-w-[100px] py-2 text-sm rounded-lg bg-green-500 text-white hover:bg-green-600 shadow-md flex justify-center items-center gap-1"
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
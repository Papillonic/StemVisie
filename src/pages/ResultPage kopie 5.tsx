"use client";

import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import StickyBar from "../components/StickyBar";
import GlassCard from "../components/GlassCard";
import { mockParties } from "../lib/mockData";
import { PARTY_HOUSE_STYLES } from "../lib/partyHouseStyles";
import KamerHalveCirkel from "../components/KamerHalveCirkelWelcomeReal";
import {
  kamerLayoutNov2023_Nov2025,
  kamerLayoutVanafFeb2026,
} from "../lib/kamerLayouts";

export default function ResultPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const amendments = location.state?.amendments ?? [];
  const userVotes = location.state?.userVotes ?? [];

  const hasVotes = userVotes.length > 0;

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

  const results = mockParties.map((party) => {
    let matches = 0;
    let total = 0;

    if (hasVotes) {
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
    }

    return {
      name: party.name,
      abbreviation: party.abbreviation,
      percentage: hasVotes && total
        ? Math.round((matches / total) * 100)
        : 0,
    };
  });

  results.sort((a, b) => b.percentage - a.percentage);

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

        <GlassCard className="w-full max-w-4xl h-[400px] p-4 flex flex-col">

          {!hasVotes && (
            <div className="mb-4 p-3 rounded-lg bg-yellow-500/20 border border-yellow-400/30 text-center">
              <p className="text-yellow-200 font-bold text-sm">
                Je hebt nog geen stemmen uitgebracht — alle partijen staan op 0%.
              </p>
            </div>
          )}

          <p className="text-white font-bold text-sm text-center mb-4">
            Jouw politieke match op basis van {userVotes.length} van de{" "}
            {amendments.length} moties
          </p>

          <div className="max-h-[400px] overflow-y-auto pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">

              {results.map((r) => {
                const bgColor =
                  PARTY_HOUSE_STYLES[r.abbreviation.toUpperCase()] ?? "#555";

                return (
                  <div
                    key={r.name}
                    className="flex flex-col items-center p-1 rounded-lg shadow-md hover:scale-105 transition-transform duration-200"
                    style={{
                      backgroundColor: bgColor,
                      minHeight: "90px",
                    }}
                  >
                    <div className="w-8 h-8 mb-1 rounded-full bg-white flex items-center justify-center p-0.5">
                      <img
                        src={`/party-logos/${r.abbreviation.toLowerCase()}.svg`}
                        alt={r.name}
                        className="w-6 h-6 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/party-logos/placeholder.png";
                        }}
                      />
                    </div>

                    <div className="h-5 mb-1 flex items-center justify-center text-center w-full">
                      <span className="text-white font-bold text-xs leading-tight">
                        {r.name}
                      </span>
                    </div>

                    <div className="w-full mt-auto">
                      <div className="bg-gray-300 rounded-full h-2.5 relative overflow-hidden">
                        <div
                          className="h-2.5 rounded-full flex items-center justify-end pr-1 text-white font-bold text-[10px] transition-all duration-500"
                          style={{
                            width: `${r.percentage}%`,
                            minWidth: "30px",
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

        </GlassCard>
      </div>

      <StickyBar>
        <div className="w-full max-w-xl mx-auto px-4 flex gap-2">

          <button
            className="flex-1 py-2 text-sm rounded-lg bg-blue-500 text-white"
            onClick={() => navigate("/")}
          >
            🏠 Terug naar start
          </button>

          <button
            className="flex-1 py-2 text-sm rounded-lg bg-blue-400 text-white"
            onClick={() => navigate("/filter")}
          >
            🔄 Opnieuw stemmen
          </button>

          <button
            className="flex-1 py-2 text-sm rounded-lg bg-green-500 text-white"
            onClick={() =>
              navigate("/detail", { state: { amendments, userVotes } })}
          >
            📄 Bekijk details
          </button>

        </div>
      </StickyBar>

    </Layout>
  );
}
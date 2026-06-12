"use client";

import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";

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

import type { Amendment, VoteSubmission } from "../types";

export default function ResultPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // ===== FIX 1: SAFE INIT (NO UI CHANGE) =====
  const [amendments, setAmendments] = useState<Amendment[]>(() => {
    const fromState = location.state?.amendments;
    if (fromState?.length) return fromState;

    const stored = localStorage.getItem("voting_amendments");
    return stored ? JSON.parse(stored) : [];
  });

  const [userVotes, setUserVotes] = useState<VoteSubmission[]>(() => {
    const fromState = location.state?.userVotes;
    if (fromState?.length) return fromState;

    const stored = localStorage.getItem("voting_userVotes");
    return stored ? JSON.parse(stored) : [];
  });

  const hasVotes = userVotes.length > 0;

  // ===== FIX 2: SYNC STATE (ONLY LOGIC) =====
  useEffect(() => {
    if (location.state?.amendments?.length) {
      setAmendments(location.state.amendments);
      localStorage.setItem(
        "voting_amendments",
        JSON.stringify(location.state.amendments)
      );
    }

    if (location.state?.userVotes?.length) {
      setUserVotes(location.state.userVotes);
      localStorage.setItem(
        "voting_userVotes",
        JSON.stringify(location.state.userVotes)
      );
    }
  }, [location.state]);

  // ===== CHAMBER LAYOUT =====
  const chamberLayout =
    Date.now() >= Date.parse(kamerLayoutVanafFeb2026.startDate)
      ? kamerLayoutVanafFeb2026
      : kamerLayoutNov2023_Nov2025;

  const partyAbbreviations = [
    ...new Set(chamberLayout.seats.map((s) => s.partyAbbreviation)),
  ];

  const generateRandomParties = () =>
    partyAbbreviations.map((abbr) => {
      const random = Math.random();
      const party = mockParties.find((p) => p.abbreviation === abbr);

      let voor = 0;
      let tegen = 0;
      let onthouden = 0;

      if (random < 0.5) {
        voor = 1;
      } else {
        tegen = 1;
      }

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

  // ===== RESULTS LOGIC (UNCHANGED) =====
  const results = useMemo(() => {
    return mockParties
      .map((party) => {
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

            if (userVote.vote === majority) {
              matches++;
            }

            total++;
          }
        }

        return {
          name: party.name,
          abbreviation: party.abbreviation,
          percentage: hasVotes && total ? Math.round((matches / total) * 100) : 0,
          totalVotes: total,
        };
      })
      .filter((r) => r.totalVotes > 0)
      .sort((a, b) => b.percentage - a.percentage);
  }, [userVotes, hasVotes]);

  // ===== UI (100% SAME) =====
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

          {results.length > 0 && (
            <div className="mb-4 text-center">
              <h2 className="text-white font-bold text-xl flex flex-wrap justify-center items-center gap-2">
                <span>Beste match: {results[0].name}</span>
                <span className="text-base">
                  • {results[0].percentage}% overeenkomst op {results[0].totalVotes} moties
                </span>
              </h2>
            </div>
          )}

          <p className="text-white font-bold text-sm text-center mb-3">
            Jouw politieke match op basis van {userVotes.length} van de {amendments.length} moties
          </p>

          <div className="max-h-[400px] overflow-y-auto pr-1">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {results.map((r) => {
                const bgColor =
                  PARTY_HOUSE_STYLES[r.abbreviation.toUpperCase()] ?? "#555";

                return (
                  <div
                    key={r.name}
                    className="flex flex-col items-center p-1 rounded-lg shadow-md hover:scale-105 transition-transform duration-200"
                    style={{ backgroundColor: bgColor }}
                  >
                    <div className="w-7 h-7 mb-0.5 rounded-full bg-white flex items-center justify-center p-0.5">
                      <img
                        src={`/party-logos/${r.abbreviation.toLowerCase()}.svg`}
                        alt={r.name}
                        className="w-5 h-5 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/party-logos/placeholder.png";
                        }}
                      />
                    </div>

                    <div className="h-4 mb-0.5 flex items-center justify-center text-center w-full">
                      <span className="text-white font-bold text-[10px] leading-tight">
                        {r.name}
                      </span>
                    </div>

                    <p className="text-[9px] text-white/80 mb-0.5">
                      {r.totalVotes} moties
                    </p>

                    <div className="w-full mt-auto">
                      <div className="bg-gray-300 rounded-full h-2 relative overflow-hidden">
                        <div
                          className="h-2 rounded-full flex items-center justify-end pr-1 text-white font-bold text-[9px] transition-all duration-500"
                          style={{
                            width: `${Math.max(r.percentage, 8)}%`,
                            minWidth: "26px",
                            backgroundColor:
                              r.percentage >= 75
                                ? "#22c55e"
                                : r.percentage >= 50
                                ? "#eab308"
                                : r.percentage >= 25
                                ? "#f97316"
                                : "#ef4444",
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
              navigate("/detail", {
                state: { amendments, userVotes },
              })
            }
          >
            📄 Bekijk details
          </button>
        </div>
      </StickyBar>
    </Layout>
  );
}
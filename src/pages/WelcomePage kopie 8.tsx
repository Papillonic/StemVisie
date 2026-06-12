"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import GlassCard from "../components/GlassCard";
import StickyBar from "../components/StickyBar";
import KamerHalveCirkel from "../components/KamerHalveCirkelWelcomeReal";
import PartiesTicker from "../components/PartiesTicker";
import { mockParties } from "../lib/mockData";

import {
  kamerLayoutNov2023_Nov2025,
  kamerLayoutVanafFeb2026,
} from "../lib/kamerLayouts";

export default function WelcomePage() {
  const navigate = useNavigate();

  const today = new Date();
  const chamberLayout =
    today >= new Date(kamerLayoutVanafFeb2026.startDate)
      ? kamerLayoutVanafFeb2026
      : kamerLayoutNov2023_Nov2025;

  const partyMap = useMemo(
    () =>
      Object.fromEntries(
        mockParties.map((p) => [p.abbreviation, p.name])
      ),
    []
  );

  const partyAbbreviations = [
    ...new Set(chamberLayout.seats.map((s) => s.partyAbbreviation)),
  ];

  const generateRandomParties = () =>
    partyAbbreviations.map((abbr) => {
      const random = Math.random();

      return {
        id: abbr,
        name: partyMap[abbr] ?? abbr,
        abbreviation: abbr,
        votes: {
          welcome: {
            voor: random < 0.5 ? 1 : 0,
            tegen: random >= 0.5 ? 1 : 0,
            onthouden: 0,
          },
        },
      };
    });

  const [partiesWithVotes, setPartiesWithVotes] = useState(
    generateRandomParties()
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setPartiesWithVotes(generateRandomParties());
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <Layout>
      {/* 🔵 Halve cirkel */}
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

      {/* 🟢 Content */}
      <div className="relative w-full flex flex-col items-center px-4 pb-32">
        <GlassCard className="w-full p-6 space-y-4 relative -mt-2 min-h-[400px] z-10">
          <h1 className="text-3xl font-bold text-white">Welkom</h1>

          <p className="text-white/80">
            Bekijk hoe de Tweede Kamer zou kunnen stemmen. De stemmen worden
            hier willekeurig gegenereerd.
          </p>
        </GlassCard>
      </div>

      {/* 🟣 TICKER → FIXED boven StickyBar */}
      <div className="fixed bottom-16 left-0 w-full flex justify-center z-20 pointer-events-none">
        <div className="w-full opacity-90">
          <PartiesTicker />
        </div>
      </div>

      {/* 🔘 Start knop */}
      <StickyBar className="z-30">
        <div className="w-full max-w-md mx-auto px-4 flex justify-center">
          <button
            className="w-auto px-6 py-2 text-sm bg-blue-500 rounded-lg text-white hover:bg-blue-600 transition-colors"
            onClick={() => navigate("/filter")}
          >
            Start
          </button>
        </div>
      </StickyBar>
    </Layout>
  );
}
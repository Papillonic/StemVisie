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
    ...new Set(
      chamberLayout.seats.map(
        (s) => s.partyAbbreviation
      )
    ),
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

  const [partiesWithVotes, setPartiesWithVotes] =
    useState(generateRandomParties());

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
      <div className="relative w-full flex flex-col items-center px-4 pt-6 pb-32">
        <GlassCard className="w-full p-6 relative -mt-2 min-h-[340px] z-10 flex flex-col items-center justify-center text-center backdrop-blur-xl">
          <h1 className="text-4xl font-bold tracking-tight text-white mb-4">
            Welkom
          </h1>

          {/* 🏛️ Iconen */}
          <div className="my-5 flex justify-center gap-6 text-3xl opacity-90">
            <span>🗳️</span>
            <span>🏛️</span>
            <span>📜</span>
          </div>

          <p className="text-white font-bold leading-7 max-w-2xl">
            Stem op echte moties uit de Tweede Kamer alsof je
            zelf in het parlement zit. Op basis van jouw keuzes
            zie je met welke politieke partijen jouw stemgedrag
            het meest overeenkomt.
            <br />
            <br />

            <span className="text-white/80 text-sm">
              Onafhankelijk en niet verbonden aan de Tweede
              Kamer of politieke partijen. Dit is geen
              stemadvies.
            </span>
          </p>
        </GlassCard>
      </div>

      {/* 🟣 TICKER */}
      <div className="fixed bottom-16 left-0 w-full flex justify-center z-20 pointer-events-none">
        <div className="w-full max-w-4xl mx-auto opacity-90">
          <PartiesTicker />
        </div>
      </div>

      {/* 🔘 Start knop */}
      <StickyBar className="z-30">
        <div className="w-full max-w-md mx-auto px-4 flex justify-center">
          <button
            className="w-auto px-6 py-2 text-sm bg-blue-500 rounded-lg text-white hover:bg-blue-600 transition-colors font-bold shadow-lg shadow-blue-500/30"
            onClick={() => navigate("/filter")}
          >
            Begin met stemmen
          </button>
        </div>
      </StickyBar>
    </Layout>
  );
}
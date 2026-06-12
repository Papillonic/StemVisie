// src/pages/WelcomePage.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import GlassCard from "../components/GlassCard";
import StickyBar from "../components/StickyBar";
import KamerHalveCirkel from "../components/KamerHalveCirkelWelcomeReal";
import {
  kamerLayoutNov2023_Nov2025,
  kamerLayoutVanafNov2025,
} from "../lib/kamerLayouts";

export default function WelcomePage() {
  const navigate = useNavigate();

  // juiste kamerindeling op basis van systeemdatum
  const today = new Date();
  const chamberLayout =
    today >= new Date(kamerLayoutVanafNov2025.startDate)
      ? kamerLayoutVanafNov2025
      : kamerLayoutNov2023_Nov2025;

  // partijen uit kamerindeling halen
  const partyAbbreviations = [
    ...new Set(chamberLayout.seats.map((s) => s.partyAbbreviation)),
  ];

  const generateRandomParties = () =>
    partyAbbreviations.map((abbr) => {
      const random = Math.random();
       let voor = 0;
    let tegen = 0;
    let onthouden = 0; // altijd 0

    if (random < 0.5) voor = 1; // 50% kans voor
    else tegen = 1;             // 50% kans tegen

      return {
        id: abbr,
        name: abbr,
        abbreviation: abbr,
        votes: {
          welcome: {
            voor,
            tegen,
            onthouden,
          },
        },
      };
    });

  const [partiesWithVotes, setPartiesWithVotes] = useState(
    generateRandomParties()
  );

  // elke 1.5 sec nieuwe random stemmen
  useEffect(() => {
    const interval = setInterval(() => {
      setPartiesWithVotes(generateRandomParties());
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <Layout>
      {/* Halve cirkel */}
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

      {/* Content */}
      <div className="relative w-full flex flex-col items-center px-4 pb-32">
        <GlassCard className="w-full p-6 space-y-4 relative -mt-2 min-h-[287px] z-10">
          <h1 className="text-3xl font-bold">Welkom</h1>
          <p className="text-white/80">
            Bekijk hoe de Tweede Kamer zou kunnen stemmen. De stemmen worden
            hier willekeurig gegenereerd.
          </p>
        </GlassCard>
      </div>

      {/* Start knop */}
      <StickyBar className="z-20">
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
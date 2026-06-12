// src/pages/WelcomePage.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import GlassCard from "../components/GlassCard";
import StickyBar from "../components/StickyBar";
import KamerHalveCirkel from "../components/KamerHalveCirkelWelcomeReal";
import { mockParties } from "../lib/mockData";
import { kamerLayoutNov2023_Nov2025, kamerLayoutVanafNov2025 } from "../lib/kamerLayouts";

export default function WelcomePage() {
  const navigate = useNavigate();

  // 1️⃣ Kies kamerindeling op basis van systeemdatum
  const today = new Date();
  const chamberLayout =
    today >= new Date(kamerLayoutVanafNov2025.startDate)
      ? kamerLayoutVanafNov2025
      : kamerLayoutNov2023_Nov2025;

  // 2️⃣ State voor random stemmen
  const [partiesWithVotes, setPartiesWithVotes] = useState(() =>
    mockParties.map((party) => ({
      ...party,
      votes: {
        welcome: {
          voor: Math.random() > 0.5 ? 1 : 0,
          tegen: Math.random() > 0.5 ? 1 : 0,
          onthouden: 0,
        },
      },
    }))
  );

  // 3️⃣ Interval om elke 1.5 sec nieuwe random stemmen te genereren
  useEffect(() => {
    const interval = setInterval(() => {
      setPartiesWithVotes(
        mockParties.map((party) => ({
          ...party,
          votes: {
            welcome: {
              voor: Math.random() > 0.5 ? 1 : 0,
              tegen: Math.random() > 0.5 ? 1 : 0,
              onthouden: 0,
            },
          },
        }))
      );
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
            scale={0.75} // ✅ Zelfde grootte als MotieDetailPage
          />
        </div>
      </div>

      {/* Content */}
      <div className="relative w-full flex flex-col items-center px-4 pb-32">
        <GlassCard className="w-full p-6 space-y-4 relative -mt-2 min-h-[287px] z-10">
          <h1 className="text-3xl font-bold">Welkom bij de App</h1>
          <p className="text-white/80">
            Dit is de introductiepagina. Klik op Start om verder te gaan.
          </p>
        </GlassCard>
      </div>

      {/* Sticky start-knop */}
      <StickyBar className="z-20">
        <div className="w-full max-w-md mx-auto px-4 flex justify-center">
          <button
            className="w-auto px-6 py-2 text-sm bg-blue-500 rounded-lg text-white hover:bg-blue-600 transition-colors"
            onClick={() => navigate("/filter")}
          >
            Start met stemmen
          </button>
        </div>
      </StickyBar>
    </Layout>
  );
}
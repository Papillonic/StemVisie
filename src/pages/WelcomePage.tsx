"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { posthog, getDistinctId } from "../lib/posthog";

import Layout from "../components/Layout";
import GlassCard from "../components/GlassCard";
import StickyBar from "../components/StickyBar";
import KamerHalveCirkel from "../components/KamerHalveCirkelWelcomeReal";
import PartiesTicker from "../components/PartiesTicker";

import {
  mockParties,
  mockAmendments,
} from "../lib/mockData";

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

const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  const check = () => setIsMobile(window.innerWidth < 768);
  check();
  window.addEventListener("resize", check);
  return () => window.removeEventListener("resize", check);
}, []);

  const partyAbbreviations = useMemo(
    () => [
      ...new Set(
        chamberLayout.seats.map(
          (s) => s.partyAbbreviation
        )
      ),
    ],
    [chamberLayout]
  );

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

  // ===== QUICK START SETS =====

  const latestAmendments = [...mockAmendments]
    .sort(
      (a, b) =>
        new Date(b.stemDatum).getTime() -
        new Date(a.stemDatum).getTime()
    )
    .slice(0, 10);

  const foreignAmendments = mockAmendments
    .filter((a) => {
      const text =
        `${a.title} ${a.description}`.toLowerCase();

      return (
        text.includes("gaza") ||
        text.includes("israel") ||
        text.includes("palestina") ||
        text.includes("oekraïne") ||
        text.includes("rusland") ||
        text.includes("navo") ||
        text.includes("nato") ||
        text.includes("europa") ||
        text.includes("internationaal")
      );
    })
    .slice(0, 10);

  const cdaAmendments = mockAmendments
    .filter((a) =>
      a.indieners?.some(
        (i) =>
          i.fractie?.toLowerCase() === "cda"
      )
    )
    .slice(0, 10);

  const randomAmendments = [...mockAmendments]
    .sort(() => Math.random() - 0.5)
    .slice(0, 10);

  const quickButtons = [
    {
      label: "🔥 Laatste 10",
      amendments: latestAmendments,
    },
    {
      label: "🌍 Buitenland",
      amendments: foreignAmendments,
    },
    {
      label: "🏛️ CDA",
      amendments: cdaAmendments,
    },
    {
      label: "🎲 Verrassing",
      amendments: randomAmendments,
    },
  ];

  const startVoting = (
    amendments: typeof mockAmendments,
    quickStartLabel?: string
  ) => {
    posthog.capture({
      distinctId: getDistinctId(),
      event: 'voting session started',
      properties: {
        source: 'quick_start',
        quick_start_label: quickStartLabel,
        amendment_count: amendments.length,
      },
    });
    navigate("/voting", {
      state: {
        amendments,
      },
    });
  };

  return (
    <Layout>
      {/* 🔵 Halve cirkel */}
      <div className="fixed top-0 left-0 w-full flex justify-center z-0 pointer-events-none">
        <div className="w-full max-w-3xl">
          <KamerHalveCirkel
            parties={partiesWithVotes}
            amendmentId="welcome"
            chamberLayout={chamberLayout}
            scale={isMobile ? 1.1 : 0.75}
          />
        </div>
      </div>

      {/* 🟢 Content */}
      <div className="relative flex flex-col items-center w-full px-4 pb-32">
   <GlassCard
  className={`w-full p-6 overflow-y-auto space-y-4 ${
    isMobile
      ? "h-[520px] -mt-16"
      : "h-[400px] -mt-2"
  }`}
>
 <h1 className="text-4xl font-bold tracking-tight text-white mb-4 text-center">
            Welkom
          </h1>

          <p className="text-white font-bold leading-7 max-w-2xl mb-6 mt-2 text-center mx-auto">
            Stem op echte moties uit de Tweede Kamer alsof je
            zelf in het parlement zit. Vergelijk jouw
            stemgedrag met dat van politieke partijen.
          </p>

          {/* ⚡ QUICK START */}
          <div className="w-full flex flex-col items-center space-y-3">
            <p className="text-white/90 text-sm font-bold uppercase tracking-wide">
              Snel starten
            </p>

            <div className="flex justify-center gap-2 overflow-x-auto pb-1 scrollbar-hide max-w-full w-full">
              {quickButtons.map((button) => (
                <button
                  key={button.label}
                  onClick={() =>
                    startVoting(button.amendments, button.label)
                  }
                  className="
                    min-w-[110px]
                    min-h-[68px]
                    rounded-xl
                    bg-white/15
                    border
                    border-white/20
                    hover:bg-white/25
                    transition-all
                    duration-200
                    px-3
                    py-3
                    text-center
                    text-white
                    font-bold
                    backdrop-blur-md
                    flex
                    flex-col
                    justify-center
                    items-center
                    shrink-0
                  "
                >
                  <div className="flex flex-col items-center justify-center gap-1">
                    <span className="text-sm leading-tight">
                      {button.label}
                    </span>

                    <span className="text-white/70 text-xs">
                      {button.amendments.length} moties
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <p className="text-white/80 text-xs font-bold leading-relaxed max-w-xl mt-3 text-center mx-auto">
            Onafhankelijk en niet verbonden aan de Tweede
            Kamer of politieke partijen. Dit is geen
            stemadvies.
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
            Zelf filters kiezen
          </button>
        </div>
      </StickyBar>
    </Layout>
  );
}
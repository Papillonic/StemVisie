"use client";

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { posthog} from "../lib/posthog";
import Layout from "../components/Layout";
import GlassCard from "../components/GlassCard";
import StickyBar from "../components/StickyBar";
import type { Amendment, Vote, VoteSubmission } from "../types";
import KamerHalveCirkel from "../components/KamerHalveCirkelWelcomeReal";
import {
  kamerLayoutNov2023_Nov2025,
  kamerLayoutVanafFeb2026,
} from "../lib/kamerLayouts";

import { mockParties } from "../lib/mockData";

export default function VotingPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // =========================
  // NEW SESSION ONLY WHEN AMENDMENTS CHANGED
  // =========================
  const amendmentsFromNav: Amendment[] = location.state?.amendments ?? [];

  const storedAmendmentsRaw = localStorage.getItem("voting_amendments");

 const [flash, setFlash] = useState(false);  	

  if (amendmentsFromNav.length > 0) {
    const incoming = JSON.stringify(amendmentsFromNav);

    if (storedAmendmentsRaw !== incoming) {
      localStorage.setItem("voting_amendments", incoming);
      localStorage.removeItem("voting_userVotes");
      localStorage.removeItem("voting_index");
    }
  }

  const storedAmendments = localStorage.getItem("voting_amendments");
  const storedVotes = localStorage.getItem("voting_userVotes");
  const storedIndex = localStorage.getItem("voting_index");

  const amendments: Amendment[] =
    amendmentsFromNav.length > 0
      ? amendmentsFromNav
      : storedAmendments
      ? JSON.parse(storedAmendments)
      : [];

  const [index, setIndex] = useState<number>(
    storedIndex ? JSON.parse(storedIndex) : 0
  );

  const [userVotes, setUserVotes] = useState<VoteSubmission[]>(
    storedVotes ? JSON.parse(storedVotes) : []
  );

const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  const check = () => setIsMobile(window.innerWidth < 768);
  check();
  window.addEventListener("resize", check);
  return () => window.removeEventListener("resize", check);
}, []);

  const [textMode, setTextMode] =
    useState<"simple" | "short" | "full">("short");

  //const [flash, setFlash] = useState(false);

  // =========================
  // STORAGE SYNC
  // =========================
  useEffect(() => {
    if (amendments.length > 0) {
      localStorage.setItem("voting_amendments", JSON.stringify(amendments));
    }
  }, [amendments]);

  useEffect(() => {
    localStorage.setItem("voting_userVotes", JSON.stringify(userVotes));
  }, [userVotes]);

  useEffect(() => {
    localStorage.setItem("voting_index", JSON.stringify(index));
  }, [index]);

  const current = amendments[index];

  if (!current) {
    return <Layout>Geen moties geselecteerd</Layout>;
  }

  const total = amendments.length;
  const isLast = index === total - 1;

  const selectedVote =
    userVotes.find((v) => v.amendmentId === current.id)?.vote ?? null;

  let descriptionText = current.description;

  if (textMode === "full") {
    descriptionText = current.fullDescription ?? current.description;
  }

  if (textMode === "simple") {
    descriptionText = current.simplified ?? current.description;
  }

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
      const party = mockParties.find((p) => p.abbreviation === abbr);

      return {
        id: abbr,
        name: party?.name ?? abbr,
        abbreviation: abbr,
	color: abbr,
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

  // =========================
  // HANDLE VOTE
  // =========================
  const handleVote = (vote: Vote) => {
    setUserVotes((prev) => [
      ...prev.filter((v) => v.amendmentId !== current.id),
      { amendmentId: current.id, vote },
    ]);

    posthog.capture('vote_cast', {
  vote,
  amendment_id: current.id,
  amendment_title: current.title,
  amendment_index: index + 1,
  total_amendments: total,
});

    if (isLast) {
      setFlash(true);
      setTimeout(() => setFlash(false), 500);
    }

    setTimeout(() => {
      setIndex((i) => (i < total - 1 ? i + 1 : i));
    }, 250);
  };

  // =========================
  // FINISH (SAFE CLEAN)
  // =========================
  const handleFinish = () => {
    localStorage.removeItem("voting_index");

    posthog.capture('voting_completed', {
  votes_cast: userVotes.length,
  total_amendments: amendments.length,
});

    navigate("/result", {
      state: {
        userVotes,
        amendments,
      },
    });
  };

  //const buttonWidth = "120px";
  //const navButtonWidth = "150px";

  return (
    <Layout>
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

      <div className="relative flex flex-col items-center w-full px-4 pb-32">
    <GlassCard
  className={`w-full p-6 overflow-y-auto space-y-4 ${
    isMobile
      ? "h-[520px] -mt-16"
      : "h-[400px] -mt-2"
  }`}
>
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              {["full", "short", "simple"].map((mode) => (
                <button
                  key={mode}
                  className={`px-3 py-1 rounded font-bold ${
                    textMode === mode
                      ? "bg-white text-black"
                      : "bg-white/20 text-white/80"
                  }`}
                  onClick={() => setTextMode(mode as any)}
                >
                  {mode}
                </button>
              ))}
            </div>

            <p className="text-white font-bold text-sm">
              Motie {index + 1} van {total}
            </p>
          </div>

          <h2 className="text-xl font-semibold text-white">
            {current.title}
          </h2>

          <div className="overflow-y-auto flex-1 text-white font-bold">
            {descriptionText}
          </div>
        </GlassCard>
      </div>
<StickyBar>
  <div className="w-full max-w-2xl flex flex-wrap sm:flex-nowrap justify-center items-center gap-2 px-2">

    {/* Vorige (altijd links op desktop, boven/links op mobiel door wrap) */}
    <button
      disabled={index === 0}
      className="flex-1 sm:flex-none sm:w-[120px] py-2 text-sm rounded-lg bg-blue-600 text-white disabled:opacity-50"
      onClick={() => setIndex((i) => Math.max(0, i - 1))}
    >
      Vorige
    </button>

    {/* VOOR */}
    <button
      className={`flex-1 sm:flex-none sm:w-[120px] py-2 text-sm rounded-lg font-semibold ${
        selectedVote === "voor"
          ? "bg-green-600 text-white"
          : "bg-green-300 text-green-950"
      }`}
      onClick={() => handleVote("voor")}
    >
      Voor
    </button>

    {/* TEGEN */}
    <button
      className={`flex-1 sm:flex-none sm:w-[120px] py-2 text-sm rounded-lg font-semibold ${
        selectedVote === "tegen"
          ? "bg-red-600 text-white"
          : "bg-red-300 text-red-950"
      }`}
      onClick={() => handleVote("tegen")}
    >
      Tegen
    </button>

    {/* ONTHOUDEN */}
    <button
      className={`flex-1 sm:flex-none sm:w-[120px] py-2 text-sm rounded-lg font-semibold ${
        selectedVote === "onthouden"
          ? "bg-gray-600 text-white"
          : "bg-gray-300 text-gray-900"
      }`}
      onClick={() => handleVote("onthouden")}
    >
      Onthouden
    </button>

{/* Volgende / Afronden */}
{!isLast ? (
  <button
    className="flex-1 sm:flex-none sm:w-[120px] py-2 text-sm rounded-lg bg-blue-600 text-white"
    onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}
  >
    Volgende
  </button>
) : (
  <button
    className={`flex-1 sm:flex-none sm:w-[120px] py-2 text-sm rounded-lg bg-blue-600 text-white transition-transform duration-300 ${
      flash ? "scale-110" : "scale-100"
    }`}
    onClick={handleFinish}
  >
    Afronden
  </button>
)}
  </div>
</StickyBar>
    </Layout>
  );
}
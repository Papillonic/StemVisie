"use client";

import { useMemo, useState , useEffect} from "react";
import { useNavigate, useLocation } from "react-router-dom";

import Layout from "../components/Layout";
import GlassCard from "../components/GlassCard";
import StickyBar from "../components/StickyBar";
import KamerHalveCirkel from "../components/KamerHalveCirkel";

import { mockParties } from "../lib/mockData";
import { PARTY_HOUSE_STYLES } from "../lib/partyHouseStyles";

import type { VoteSubmission, Amendment } from "../types";

import { getLayoutForDate } from "../lib/kamerLayouts";

export default function MotieDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // ===== STATE INPUT =====
  const state = location.state as
    | {
        amendments?: Amendment[];
        userVotes?: VoteSubmission[];
      }
    | undefined;

  // ===== LOCALSTORAGE FALLBACK =====
  const storedAmendments = localStorage.getItem("voting_amendments");
  const storedVotes = localStorage.getItem("voting_userVotes");

  const amendments: Amendment[] =
    state?.amendments ??
    (storedAmendments ? JSON.parse(storedAmendments) : []);

  const userVotes: VoteSubmission[] =
    state?.userVotes ??
    (storedVotes ? JSON.parse(storedVotes) : []);

  const [index, setIndex] = useState(0);

  const current = amendments[index];

  if (!current) {
    return (
      <Layout>
        <GlassCard className="p-6 text-center text-white">
          Geen moties beschikbaar
        </GlassCard>
      </Layout>
    );
  }


  // ===== USER VOTE =====
  const userVote =
    userVotes.find((v) => v.amendmentId === current.id)?.vote ?? "-";

  // ===== MAJORITY HELPER =====
  function getMajorityVote(v: {
    voor: number;
    tegen: number;
    onthouden: number;
  }) {
    if (v.voor >= v.tegen && v.voor >= v.onthouden) return "voor";
    if (v.tegen >= v.voor && v.tegen >= v.onthouden) return "tegen";
    return "onthouden";
  }

  // ===== CHAMBER LAYOUT =====
const chamberLayout = getLayoutForDate(current.stemDatum);

  // ===== TOTAL VOTE COUNT =====
  const totalVotes = mockParties
    .map((p) => p.votes[current.id])
    .filter(Boolean)
    .reduce(
      (acc, v) => ({
        voor: acc.voor + (v?.voor ?? 0),
        tegen: acc.tegen + (v?.tegen ?? 0),
        onthouden: acc.onthouden + (v?.onthouden ?? 0),
      }),
      { voor: 0, tegen: 0, onthouden: 0 }
    );

const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  const check = () => setIsMobile(window.innerWidth < 768);
  check();
  window.addEventListener("resize", check);
  return () => window.removeEventListener("resize", check);
}, []);

  const motionResult = getMajorityVote(totalVotes);

  const resultText =
    motionResult === "voor"
      ? "Motie aangenomen"
      : motionResult === "tegen"
      ? "Motie afgewezen"
      : "Motie onthouden";

const formattedDate = new Date(current.stemDatum).toLocaleDateString(
  "nl-NL",
  {
    day: "numeric",
    month: "long",
    year: "numeric",
  }
);

  // ===== PARTIES =====
  const visibleParties = useMemo(() => {
    return mockParties
      .map((party) => {
        const partyVote = party.votes[current.id];

        if (!partyVote) return null;

        const seats =
          partyVote.voor +
          partyVote.tegen +
          partyVote.onthouden;

        if (seats === 0) return null;

        const majority = getMajorityVote(partyVote);

        const voteColor =
          majority === "voor"
            ? "bg-green-500"
            : majority === "tegen"
            ? "bg-red-500"
            : "bg-yellow-400";

        const backgroundColor =
          PARTY_HOUSE_STYLES[
            party.abbreviation as keyof typeof PARTY_HOUSE_STYLES
          ] ?? "#444";

        return {
          ...party,
          seats,
          majority,
          voteColor,
          backgroundColor,
        };
      })
      .filter(Boolean)
      .sort((a: any, b: any) => b.seats - a.seats);
  }, [current.id]);

  return (
    <Layout>
      {/* CHAMBER VISUAL */}
      <div className="fixed top-0 left-0 w-full flex justify-center z-0 pointer-events-none">
        <div className="w-full max-w-3xl">
          <KamerHalveCirkel
            parties={mockParties}
            amendmentId={current.id}
            chamberLayout={chamberLayout}
  scale={isMobile ? 1.1 : 0.75}
     
     />
        </div>
      </div>

      {/* CONTENT */}
      <div className="relative flex flex-col items-center w-full px-4 pb-32">
        <GlassCard className="w-full max-w-4xl min-h-[400px] max-h-[70vh] overflow-hidden p-4 flex flex-col">

          {/* TOP INFO */}
          <div className="flex items-center justify-between text-sm mb-4 gap-2 flex-wrap">
            <div className="font-bold text-white">
              {resultText}  · {formattedDate}
            </div>

            <div className="text-white text-center font-bold">
              {totalVotes.voor} voor · {totalVotes.tegen} tegen
              {totalVotes.onthouden > 0 &&
                ` · ${totalVotes.onthouden} onthouden`}
            </div>

            <div className="flex items-center gap-1 text-white">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  userVote === "voor"
                    ? "bg-green-400"
                    : userVote === "tegen"
                    ? "bg-red-400"
                    : userVote === "onthouden"
                    ? "bg-yellow-400"
                    : "bg-gray-400"
                }`}
              />

              <span className="text-xs font-bold">
                Jouw stem: {userVote}
              </span>
            </div>
          </div>

          <div className="border-t border-white/20 mb-2"></div>

          {/* PARTIES */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1.5 text-white font-bold">
              {visibleParties.map((party: any) => (
                <div
                  key={party.id}
                  className="flex items-center gap-2 p-1.5 rounded text-white font-bold min-h-[54px]"
                  style={{
                    backgroundColor: party.backgroundColor,
                  }}
                >
                  <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center p-1 shrink-0">
                    <img
                      src={`/party-logos/${party.abbreviation.toLowerCase()}.svg`}
                      alt={party.name}
                      className="w-4 h-4 object-contain"
                      onError={(e) => {
                        const target =
                          e.target as HTMLImageElement;
                        if (
                          !target.src.includes("placeholder.png")
                        ) {
                          target.src =
                            "/party-logos/placeholder.png";
                        }
                      }}
                    />
                  </div>

                  <div className="flex-1 min-w-0 relative flex flex-col items-center justify-center text-center h-full">
                    <span className="text-[7px] sm:text-[8px] font-bold leading-[0.75rem] break-words">
                      {party.name}
                    </span>

                    <div className="flex justify-center mt-0.5">
                      <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center ring-1 ring-white/40">
                        <span
                          className={`w-3 h-3 rounded-full ${party.voteColor}`}
                        />
                      </div>
                    </div>

                    <span className="absolute bottom-0 right-0 text-[8px] font-bold leading-none">
                      {party.seats}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-white/20"></div>

            {/* MOTIE TEXT */}
            <div>
              <h2 className="text-lg font-semibold text-white">
                {current.title}
              </h2>

              <p className="text-white text-sm mt-1 leading-relaxed font-bold">
                {current.description}
              </p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* NAV */}
      <StickyBar>
        <div className="w-full max-w-xl mx-auto px-4 flex items-center gap-2">
          <button
            className="px-4 py-2 text-sm rounded-lg bg-gray-500 text-white"
            onClick={() =>
              navigate("/result", {
                state: { amendments, userVotes },
              })
            }
          >
            ← Terug
          </button>

          <div className="flex-1" />

          <button
            className="px-4 py-2 text-sm rounded-lg bg-blue-500 text-white disabled:opacity-50"
            disabled={index === 0}
            onClick={() =>
              setIndex((i) => Math.max(0, i - 1))
            }
          >
            Vorige
          </button>

          <button
            className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white disabled:opacity-50"
            disabled={index === amendments.length - 1}
            onClick={() =>
              setIndex((i) =>
                Math.min(amendments.length - 1, i + 1)
              )
            }
          >
            Volgende →
          </button>
        </div>
      </StickyBar>
    </Layout>
  );
}
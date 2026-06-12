// src/pages/WelcomePage.tsx
"use client";

import React from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import GlassCard from "../components/GlassCard";
import StickyBar from "../components/StickyBar";
import PartiesTicker from "../components/PartiesTicker";

export default function WelcomePage() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="relative w-full flex flex-col items-center px-4 pb-32">
        
        {/* GlassCard ligt iets over de halve cirkel heen */}
        <GlassCard className="w-full p-6 space-y-4 relative -mt-2 min-h-[287px] z-10">
          <h1 className="text-3xl font-bold">Welkom bij de App</h1>
          <p className="text-white/80">
            Dit is de introductiepagina. Klik op Start om verder te gaan.
          </p>
        </GlassCard>

        {/* PartiesTicker direct onder GlassCard, deels onder StickyBar */}
        <div className="w-full mt-[-16px] z-0">
          <PartiesTicker />
        </div>
      </div>

      {/* StickyBar boven ticker */}
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

// src/pages/WelcomePage.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import GlassCard from "../components/GlassCard";
import StickyBar from "../components/StickyBar";
import KamerHalveCirkel from "../components/KamerHalveCirkelWelcomeReal";
import type { ChamberLayoutPeriod } from "../lib/kamerLayouts";

// Alle kamerindelingen importeren
import * as kamerLayouts from "../lib/kamerLayouts";

export default function WelcomePage() {
  const navigate = useNavigate();
  const [chamberLayout, setChamberLayout] = useState<ChamberLayoutPeriod | null>(null);

  useEffect(() => {
    const today = new Date();

    // Alle exports van kamerLayouts filteren op type ChamberLayoutPeriod
    const layouts: ChamberLayoutPeriod[] = Object.values(kamerLayouts).filter(
      (l: any) => l?.seats && l?.startDate
    );

    // Meest recente geldige layout selecteren
    const currentLayout = layouts
      .filter(l => new Date(l.startDate) <= today)
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())[0];

    setChamberLayout(currentLayout ?? null);
  }, []);

  return (
    <Layout>
      <div className="relative w-full flex flex-col items-center px-4 pb-32">
        
        {/* Halve cirkel */}
        {chamberLayout && (
          <div className="w-full max-w-3xl mx-auto mb-6">
            <KamerHalveCirkel
              parties={[]} // Hier kun je eventueel default partijen geven, of later vullen
              amendmentId="welcome"
              chamberLayout={chamberLayout}
              scale={0.75}   
            />
          </div>
        )}

        {/* GlassCard ligt iets over de halve cirkel heen */}
        <GlassCard className="w-full p-6 space-y-4 relative -mt-2 min-h-[287px] z-10">
          <h1 className="text-3xl font-bold">Welkom bij de App</h1>
          <p className="text-white/80">
            Dit is de introductiepagina. Klik op Start om verder te gaan.
          </p>
        </GlassCard>

      </div>

      {/* StickyBar */}
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
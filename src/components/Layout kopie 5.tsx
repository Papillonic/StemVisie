// src/components/Layout.tsx
import React from "react";
import KamerHalveCirkel from "./KamerHalveCirkel";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="relative min-h-screen text-white overflow-hidden">

      {/* 🌌 BACKGROUND (3 zones) */}
      <div className="absolute inset-0 flex">

        {/* 🔵 LINKS (blauwe blur depth) */}
        <div className="flex-1 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/bg.png')] bg-cover bg-left blur-md scale-110" />

          {/* blauwe tint boven blur */}
          <div className="absolute inset-0 bg-blue-900/40" />

          {/* fade naar midden */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/50 via-blue-900/20 to-transparent" />
        </div>

        {/* 🌟 MIDDEN (focus zone - lichter + subtiele blur) */}
        <div className="w-[900px] relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/bg.png')] bg-cover bg-center blur-[1.5px] scale-105 brightness-110 contrast-105" />
          <div className="absolute inset-0 bg-white/5" />
        </div>

        {/* 🔵 RECHTS (blauwe blur depth) */}
        <div className="flex-1 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/bg.png')] bg-cover bg-right blur-md scale-110" />

          {/* blauwe tint boven blur */}
          <div className="absolute inset-0 bg-blue-900/40" />

          {/* fade naar midden */}
          <div className="absolute inset-0 bg-gradient-to-l from-blue-900/50 via-blue-900/20 to-transparent" />
        </div>

      </div>

      {/* 🌌 extra globale sfeer */}
      <div className="absolute inset-0 bg-blue-900/10" />
      <div className="absolute inset-0 bg-black/10" />

      {/* 🔵 TOP DECOR */}
      <div className="fixed top-0 left-0 w-full z-0 pointer-events-none">
        <KamerHalveCirkel />
      </div>

      {/* 📄 CONTENT */}
      <main className="relative z-10 flex justify-center items-start min-h-screen px-4 pt-[280px] pb-32">
        <div className="w-full max-w-3xl flex flex-col h-full">
          {children}
        </div>
      </main>

    </div>
  );
}
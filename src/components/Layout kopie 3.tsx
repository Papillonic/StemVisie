// src/components/Layout.tsx
import React from "react";
import KamerHalveCirkel from "./KamerHalveCirkel";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="relative min-h-screen text-white overflow-hidden">

      {/* 🖼️ BACKGROUND */}
      <div className="absolute inset-0 bg-[url('/bg.png')] bg-cover bg-center bg-no-repeat" />

      {/* 🟦 BLAUWE SFEER + MEER BLUR (NIEUW) */}
      <div className="absolute inset-0 bg-blue-950/40 backdrop-blur-md" />

      {/* 🔵 EXTRA DIEPTE (maakt het “rijker”, niet alleen donkerder) */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-blue-950/30 to-blue-950/50" />

      {/* Halve cirkel bovenaan */}
      <div className="fixed top-0 left-0 w-full z-0 pointer-events-none">
        <KamerHalveCirkel />
      </div>

      {/* 📄 CONTENT */}
      <main className="relative z-10 flex justify-center items-start h-screen px-4 pt-[280px] pb-32">
        <div className="w-full max-w-3xl flex flex-col h-full">
          {children}
        </div>
      </main>

    </div>
  );
}
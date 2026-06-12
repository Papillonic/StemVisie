// src/components/Layout.tsx
import React from "react";
import KamerHalveCirkel from "./KamerHalveCirkel";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="relative min-h-screen bg-[url('/bg.png')] bg-cover bg-center bg-no-repeat text-white overflow-hidden">
      
      {/* Halve cirkel bovenaan */}
      <div className="fixed top-0 left-0 w-full z-0 pointer-events-none">
        <KamerHalveCirkel />
      </div>

      {/* Scrollable content */}
      <main className="relative z-10 flex justify-center items-start h-screen px-4 pt-[280px] pb-32">
        <div className="w-full max-w-3xl flex flex-col h-full">
          {children}
        </div>
      </main>
    </div>
  );
}

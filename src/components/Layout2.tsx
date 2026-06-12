import React from "react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout2({ children }: LayoutProps) {
  return (
    <div className="relative min-h-screen text-white overflow-hidden">

      {/* 🌌 BASE BACKGROUND */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[url('/bg.png')] bg-cover bg-center brightness-75" />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* 🔵 LEFT BLUE DEPTH */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute left-0 top-0 bottom-0 w-1/3 bg-gradient-to-r from-blue-950/90 via-blue-900/40 to-transparent" />
        <div className="absolute left-0 top-0 bottom-0 w-1/3 blur-3xl opacity-80 bg-blue-900/30" />
      </div>

      {/* 🌟 CENTER BLUR LAYER */}
      <div className="fixed inset-0 -z-10 flex justify-center">
        <div className="w-[900px] relative overflow-hidden">

          <div className="absolute inset-0 bg-[url('/bg.png')] bg-cover bg-center scale-105 blur-[1.2px]" />

          <div className="absolute inset-0 bg-black/5" />
        </div>
      </div>

      {/* 🔵 RIGHT BLUE DEPTH */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-blue-950/90 via-blue-900/40 to-transparent" />
        <div className="absolute right-0 top-0 bottom-0 w-1/3 blur-3xl opacity-80 bg-blue-900/30" />
      </div>

      {/* 🌌 EXTRA SFEER LAYER */}
      <div className="fixed inset-0 -z-10 bg-blue-900/5" />
      <div className="fixed inset-0 -z-10 bg-black/10" />

      {/* 📄 CONTENT */}
      <main className="relative z-10 flex justify-center items-start min-h-screen px-4 pt-[280px] pb-32">
        <div className="w-full max-w-4xl flex flex-col h-full">
          {children}
        </div>
      </main>

    </div>
  );
}
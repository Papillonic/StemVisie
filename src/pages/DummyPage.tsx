// src/pages/DummyPage.tsx
import React, { useState } from "react";
import GlassCard from "../components/GlassCard";
import KamerHalveCirkel from "../components/KamerHalveCirkel"; // jouw component
import StickyBar from "../components/StickyBar";

export default function DummyPage() {
  const [dummyTextLength, setDummyTextLength] = useState(5);

  // Dummy content
  const dummyContent = Array.from({ length: dummyTextLength }, (_, i) => (
    <p key={i}>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. {i + 1}
    </p>
  ));

  return (
    <div className="relative min-h-screen bg-[url('/bg.png')] bg-cover bg-center bg-no-repeat text-white overflow-hidden">
      {/* 🌞 Halve cirkel bovenaan fixed */}
      <div className="fixed top-0 left-0 w-full z-0 pointer-events-none">
        <KamerHalveCirkel />
      </div>

      {/* 🖼 Centered content container */}
      <div className="relative z-10 flex flex-col items-center justify-center h-screen px-4 pt-32 pb-32">
        <div className="w-full max-w-md flex-1 flex flex-col">
          {/* GlassCard scrollable */}
          <GlassCard className="p-6 flex-1 overflow-y-auto max-h-[70vh]">
            <h1 className="text-3xl font-bold mb-4">Dummy Scrollable Card</h1>
            <p className="mb-4">
              Dit is een dummy card die kan scrollen als hij te groot is.
            </p>
            {dummyContent}

            {/* Knop om meer content toe te voegen */}
            <button
              className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg"
              onClick={() => setDummyTextLength(dummyTextLength + 5)}
            >
              Meer content toevoegen
            </button>
          </GlassCard>
        </div>
      </div>

      {/* 🟢 Sticky bottom bar */}
      <StickyBar>
        <div className="w-full max-w-md mx-auto flex justify-between">
          <button className="px-4 py-2 bg-blue-500 rounded-lg text-white">
            Actie 1
          </button>
          <button className="px-4 py-2 bg-purple-500 rounded-lg text-white">
            Actie 2
          </button>
          <button className="px-4 py-2 bg-red-500 rounded-lg text-white">
            Actie 3
          </button>
        </div>
      </StickyBar>
    </div>
  );
}

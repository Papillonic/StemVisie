// src/components/Layout2.tsx
import React from "react";
import KamerHalveCirkel from "./KamerHalveCirkel";

interface LayoutProps {
  children: React.ReactNode;
  parties?: any[];
  amendmentId?: string | number;
  chamberLayout?: any;
}

export default function Layout2({
  children,
  parties = [],
  amendmentId,
  chamberLayout,
}: LayoutProps) {
  return (
    <div className="relative min-h-screen bg-[url('/bg.png')] bg-cover bg-center bg-no-repeat text-white overflow-hidden">

      {/* Halve cirkel bovenaan */}
      {chamberLayout && amendmentId && parties && (
        <div className="fixed top-0 left-0 w-full flex justify-center z-0 pointer-events-none">
          <div className="w-full max-w-md md:max-w-3xl">
            <KamerHalveCirkel
              parties={parties}
              amendmentId={amendmentId}
              chamberLayout={chamberLayout}
            />
          </div>
        </div>
      )}

      {/* Scrollable content */}
      <main className="relative z-10 flex justify-center items-start h-screen px-4 pt-[280px] pb-32">
        <div className="w-full max-w-3xl flex flex-col h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
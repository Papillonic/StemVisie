import type { ReactNode } from "react";

export default function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen flex flex-col">
      {/* scrollable content */}
      <div className="flex-1 overflow-y-auto flex justify-center">
        <div className="w-full max-w-md px-4 py-16 pb-32">
          {children}
        </div>
      </div>
    </div>
  );
}

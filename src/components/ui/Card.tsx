// src/components/ui/Card.tsx
import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;          // extra classes per gebruik
  transparent?: boolean;       // standaard true
  padding?: string;            // bv. "p-4", "p-8"
  rounded?: string;            // bv. "rounded-lg", "rounded-2xl"
  shadow?: string;             // bv. "shadow-md", "shadow-xl"
}

export default function Card({
  children,
  className = "",
  transparent = true,
  padding = "p-8",
  rounded = "rounded-2xl",
  shadow = "shadow-xl",
}: CardProps) {
  return (
    <div
      className={`
        ${transparent ? "backdrop-blur-lg bg-white/10 border border-white/20" : "bg-white"}
        ${padding} ${rounded} ${shadow}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

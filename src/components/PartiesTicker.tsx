"use client";

import { useEffect, useRef, useState } from "react";
import {
  kamerLayoutNov2023_Nov2025,
  kamerLayoutVanafFeb2026,
} from "@/lib/kamerLayouts";

const partySlugMap: Record<string, string> = {
  VVD: "vvd.svg",
  PVV: "pvv.svg",
  GRO: "gro.svg",
  NSC: "nsc.svg",
  D66: "d66.svg",
  BBB: "bbb.svg",
  CDA: "cda.svg",
  SP: "sp.svg",
  DEN: "den.svg",
  PVD: "pvd.svg",
  SGP: "sgp.svg",
  CHR: "chr.svg",
  FVD: "fvd.svg",
  PLU: "plu.svg",
  VOL: "vol.svg",
  JA2: "ja2.svg",
};

function getPartyLogo(slug: string) {
  const fileName = partySlugMap[slug];
  return fileName ? `/party-logos/${fileName}` : null;
}

/* 🔥 check of image echt bestaat */
function loadImage(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
  });
}

function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export default function PartiesTicker() {
  const [logos, setLogos] = useState<string[]>([]);
  const trackRef = useRef<HTMLDivElement>(null);
  const logoRefs = useRef<HTMLDivElement[]>([]);
  const animationRef = useRef<number>();
  const singleSetWidthRef = useRef(0);
  const startTimeRef = useRef(0);

  /* kies huidige kamerlayout + filter echte images */
  useEffect(() => {
    const loadLogos = async () => {
      const today = new Date();
      const currentLayout =
        today >= new Date(kamerLayoutVanafFeb2026.startDate)
          ? kamerLayoutVanafFeb2026
          : kamerLayoutNov2023_Nov2025;

      const uniqueParties = Array.from(
        new Set(currentLayout.seats.map((s) => s.partyAbbreviation))
      );

      const validLogos: string[] = [];

      for (const abbr of uniqueParties) {
        const src = getPartyLogo(abbr);
        if (!src) continue;

        const exists = await loadImage(src);
        if (exists) {
          validLogos.push(src);
        }
      }

      setLogos(shuffle(validLogos));
    };

    loadLogos();
  }, []);

  /* meet breedte */
  useEffect(() => {
    if (!logos.length) return;

    const measure = () => {
      const width = logoRefs.current
        .slice(0, logos.length)
        .reduce((acc, el) => acc + (el?.offsetWidth || 0), 0);

      singleSetWidthRef.current = width;
    };

    requestAnimationFrame(measure);
  }, [logos]);

  /* animatie */
  useEffect(() => {
    if (!trackRef.current) return;

    const speed = 150;

    const animate = (time: number) => {
      if (!startTimeRef.current) startTimeRef.current = time;

      const elapsed = (time - startTimeRef.current) / 1000;
      const distance = (elapsed * speed) % singleSetWidthRef.current;

      trackRef.current!.style.transform = `translateX(-${distance}px)`;
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationRef.current!);
  }, [logos]);

  if (!logos.length) return null;

  return (
    <div
      className="
        relative overflow-hidden
        bg-white/60 dark:bg-neutral-900/60
        backdrop-blur
        border-t border-white/20 dark:border-neutral-700/20
      "
      style={{ height: 48 }}
    >
      <div
        ref={trackRef}
        className="absolute bottom-0 left-0 flex whitespace-nowrap"
      >
        {[...logos, ...logos].map((src, i) => {
          const isFirstSet = i < logos.length;
          const isPVV = src.toLowerCase().includes("pvv.svg");

          const height = isPVV ? 40 : 28;
          const width = isPVV ? 50 : undefined;

          return (
            <div
              key={i}
              ref={(el) => {
                if (isFirstSet && el) logoRefs.current[i] = el;
              }}
              className="flex-shrink-0 px-4 h-12 flex items-center justify-center"
            >
              <img
                src={src}
                alt="Party logo"
                draggable={false}
                style={{
                  height,
                  width: width ? `${width}px` : "auto",
                  display: "block",
                }}
              />
            </div>
          );
        })}
      </div>

      <div className="pointer-events-none absolute top-0 left-0 w-24 h-full bg-gradient-to-r from-white/60 dark:from-neutral-900/60" />
      <div className="pointer-events-none absolute top-0 right-0 w-24 h-full bg-gradient-to-l from-white/60 dark:from-neutral-900/60" />
    </div>
  );
}
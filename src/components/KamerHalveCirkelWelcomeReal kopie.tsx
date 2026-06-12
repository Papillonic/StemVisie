"use client";

import type { Party } from "@shared/schema";
import { PARTY_HOUSE_STYLES } from "@/lib/partyHouseStyles";
import type { ChamberLayoutPeriod, SeatAssignment } from "@shared/schema";

interface KamerHalveCirkelProps {
  parties: Party[];
  amendmentId: string | number;
  chamberLayout: ChamberLayoutPeriod;
}

export default function KamerHalveCirkel({
  parties,
  amendmentId,
  chamberLayout
}: KamerHalveCirkelProps) {
  if (!chamberLayout?.seats) {
    return <p className="text-center text-gray-500">Geen kamerindeling</p>;
  }

  /* =========================
     Layout constants
  ========================== */
  const RINGS = [
    { seatsPerSegment: 6, radius: 320 },
    { seatsPerSegment: 5, radius: 260 },
    { seatsPerSegment: 5, radius: 200 },
    { seatsPerSegment: 4, radius: 150 },
    { seatsPerSegment: 3, radius: 100 },
    { seatsPerSegment: 2, radius: 60 },
  ];
  const SEGMENTS = 6;
  const GAP_ANGLE = Math.PI / 25;
  const MIN_SEAT_SPACING = 32;
  const HEIGHT = 28;
  const CIRCLE_RADIUS = 6;
  const SEAT_GAP_FACTOR = 0.94;
  const LABEL_OFFSET = 16;
  const centerX = 450;
  const centerY = 430;

  /* =========================
     Helper: arc path
  ========================== */
  const arcPath = (cx: number, cy: number, r: number, startAngle: number, endAngle: number) => {
    const startX = cx + r * Math.cos(startAngle);
    const startY = cy - r * Math.sin(startAngle);
    const endX = cx + r * Math.cos(endAngle);
    const endY = cy - r * Math.sin(endAngle);
    const largeArcFlag = Math.abs(endAngle - startAngle) > Math.PI ? 1 : 0;
    return `M ${endX} ${endY} A ${r} ${r} 0 ${largeArcFlag} 1 ${startX} ${startY}`;
  };

  /* =========================
     Map seats by index
  ========================== */
  const seatByIndex = new Map<number, SeatAssignment>(
    chamberLayout.seats.map((s) => [s.index, s])
  );

  /* =========================
     Compute seats
  ========================== */
  const seats: any[] = [];
  const originalRadii = RINGS.map((r) => r.radius);
  const outerGap = originalRadii[0] - originalRadii[1];
  const shiftedRings = RINGS.map((ring, i) =>
    i === 0 ? { ...ring, radius: originalRadii[0] + outerGap } : { ...ring, radius: originalRadii[i - 1] }
  );
  const ringsReversed = [...shiftedRings].reverse();

  let seatIndex = 0;
  ringsReversed.forEach((ring) => {
    const totalGapAngle = GAP_ANGLE * (SEGMENTS - 1);
    const usableAngle = Math.PI - totalGapAngle;
    const seatsPerRing = ring.seatsPerSegment * SEGMENTS;
    const idealSeatAngle = MIN_SEAT_SPACING / ring.radius;
    const scale = Math.min(1, usableAngle / (idealSeatAngle * seatsPerRing));
    const seatAngle = idealSeatAngle * scale;
    const effectiveSeatAngle = seatAngle * SEAT_GAP_FACTOR;

    let currentAngle = Math.PI;

    for (let segment = 0; segment < SEGMENTS; segment++) {
      for (let i = 0; i < ring.seatsPerSegment; i++) {
        const assignment = seatByIndex.get(seatIndex);
        seatIndex++;

        if (!assignment) {
          currentAngle -= seatAngle;
          continue;
        }

        const party = parties.find((p) => p.abbreviation === assignment.partyAbbreviation);
        if (!party) {
          currentAngle -= seatAngle;
          continue;
        }

        const voteObj = party.votes?.[amendmentId];
        let vote: "voor" | "tegen" | "onthouden" = "onthouden";
        if (voteObj) {
          if (voteObj.voor >= voteObj.tegen && voteObj.voor >= voteObj.onthouden) vote = "voor";
          else if (voteObj.tegen >= voteObj.voor && voteObj.tegen >= voteObj.onthouden) vote = "tegen";
        }

        const angle = currentAngle - effectiveSeatAngle / 2;

        seats.push({
          index: assignment.index,
          party,
          vote,
          angle,
          radius: ring.radius,
          seatAngle: effectiveSeatAngle,
          x: centerX + ring.radius * Math.cos(angle),
          y: centerY - ring.radius * Math.sin(angle),
        });

        currentAngle -= seatAngle;
      }
      currentAngle -= GAP_ANGLE;
    }
  });

  /* =========================
     Compute labels
  ========================== */
  const seatsByParty = new Map<string, any[]>();
  seats.forEach((seat) => {
    const key = seat.party.abbreviation;
    if (!seatsByParty.has(key)) seatsByParty.set(key, []);
    seatsByParty.get(key)!.push(seat);
  });

  const labels = Array.from(seatsByParty.values()).map((partySeats) => {
    const party = partySeats[0].party;
    const radii = Array.from(new Set(partySeats.map((s) => s.radius))).sort((a, b) => a - b);
    const outerRadius = Math.max(...radii);
    const ringSeats = partySeats.filter((s) => s.radius === outerRadius);
    const avgAngle = ringSeats.reduce((sum, s) => sum + s.angle, 0) / ringSeats.length;

    return {
      party,
      angle: avgAngle,
      radius: outerRadius + LABEL_OFFSET,
    };
  });

  /* =========================
     Render
  ========================== */
  return (
    <svg viewBox="0 0 900 600" className="w-full max-w-3xl mx-auto">
      {seats.map((seat) => {
        const dx = seat.x - centerX;
        const dy = seat.y - centerY;
        const rotation = (Math.atan2(dy, dx) * 180) / Math.PI + 90;

        const innerRadius = seat.radius - HEIGHT / 2;
        const outerRadius = seat.radius + HEIGHT / 2;
        const innerWidth = innerRadius * seat.seatAngle;
        const outerWidth = outerRadius * seat.seatAngle;
        const halfInner = innerWidth / 2;
        const halfOuter = outerWidth / 2;
        const halfHeight = HEIGHT / 2;

        const points = [
          [-halfInner, halfHeight],
          [halfInner, halfHeight],
          [halfOuter, -halfHeight],
          [-halfOuter, -halfHeight],
        ]
          .map(([x, y]) => `${x},${y}`)
          .join(" ");

        const partyColor = PARTY_HOUSE_STYLES[seat.party.abbreviation] ?? "#999";

        const voteColor =
          seat.vote === "voor" ? "#22c55e" : seat.vote === "tegen" ? "#ef4444" : "#9ca3af";

        return (
          <g key={seat.index} transform={`translate(${seat.x}, ${seat.y}) rotate(${rotation})`}>
            <polygon points={points} fill={partyColor} stroke="rgba(0,0,0,0.25)" strokeWidth={0.5} />
            <circle cx={0} cy={0} r={CIRCLE_RADIUS} fill={voteColor} stroke="#111" strokeWidth={1} />
          </g>
        );
      })}

      <defs>
        {labels.map((label) => {
          const estimatedTextLength = label.party.name.length * 7;
          const padding = 24;
          const angleSpan = (estimatedTextLength + padding) / label.radius;

          return (
            <path
              key={label.party.abbreviation}
              id={`label-path-${label.party.abbreviation}`}
              d={arcPath(centerX, centerY, label.radius, label.angle - angleSpan / 2, label.angle + angleSpan / 2)}
              fill="none"
            />
          );
        })}
      </defs>

      {labels.map((label) => (
        <text key={label.party.abbreviation} fontSize={12} fontWeight="bold" fill="#111">
          <textPath href={`#label-path-${label.party.abbreviation}`} startOffset="50%" textAnchor="middle">
            {label.party.name}
          </textPath>
        </text>
      ))}
    </svg>
  );
}

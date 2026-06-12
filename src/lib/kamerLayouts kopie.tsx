// lib/kamerLayouts.ts

export interface SeatAssignment {
  index: number;
  partyAbbreviation: string;
}

export interface ChamberLayoutPeriod {
  startDate: string;
  endDate: string | null;
  seats: SeatAssignment[];
}

const seats = (indices: number[], party: string): SeatAssignment[] =>
  indices.map((index) => ({ index, partyAbbreviation: party }));

/* =========================================================
   PERIODE 1 — Verkiezingen 22 nov 2023 → 11 nov 2025
   ========================================================= */

export const kamerLayoutNov2023_Nov2025: ChamberLayoutPeriod = {
  startDate: "2023-11-22",
  endDate: "2025-11-11",
  seats: [
    // GL–PvdA
    ...seats(
      [
        0, 1, 12, 13, 14,
        30, 31, 32, 33, 34, 35,
        56, 57, 58, 59, 60, 61,
        87, 88,
        114, 115, 116, 117, 118, 119,
      ],
      "GRO"
    ),

    // PVV (37)
    ...seats(
      [
        10, 11, 27, 28, 29,
        48, 49, 50, 51, 52, 53,
        74, 75, 76, 77, 78, 79, 80,
        81, 82, 83,
        107, 108, 109, 110, 111, 112, 113,
        140, 141, 142,
        144, 145, 146, 147, 148, 149,
      ],
      "PVV"
    ),

    // VVD
    ...seats(
      [
        6, 7,
        21, 22, 23,
        42, 43, 44, 45,
        71, 72, 73,
        102, 103,
        130, 131, 132, 133, 134, 135, 136, 137, 138, 139,
      ],
      "VVD"
    ),

    // NSC
    ...seats(
      [
        4, 5,
        18, 19, 20,
        38, 39, 40, 41,
        64, 65,
        94, 95,
        123, 124, 125, 126, 127, 128, 129,
      ],
      "NSC"
    ),

    // D66
    ...seats([2, 3, 15, 16, 17, 36, 37, 62, 63], "D66"),

    // BBB
    ...seats([8, 9, 24, 25, 26, 46, 47], "BBB"),

    // SP
    ...seats([54, 55, 84, 85, 86], "SP"),

    // PvdD
    ...seats([120, 121, 122], "PVD"),

    // DENK
    ...seats([89, 90, 91], "DEN"),

    // Volt
    ...seats([92, 93], "VOL"),

    // CDA
    ...seats([69, 70, 99, 100, 101], "CDA"),

    // ChristenUnie
    ...seats([96, 97, 98], "CHR"),

    // SGP
    ...seats([66, 67, 68], "SGP"),

    // FvD
    ...seats([104, 105, 106], "FVD"),

    // JA21
    ...seats([143], "JA2"),
  ],
};

/* =========================================================
   PERIODE 2 — Vanaf 12 nov 2025 (huidige indeling)
   ========================================================= */

export const kamerLayoutVanafNov2025: ChamberLayoutPeriod = {
  startDate: "2025-11-12",
  endDate: null,
  seats: [
    // GL–PvdA (20)
    ...seats(
      [
        0, 1,
        12, 13, 14,
        30, 31, 32, 33,
        54, 55, 56, 57, 58,
        84, 85, 86, 87, 88,
        117,
      ],
      "GRO"
    ),

    // D66 (26)
    ...seats(
      [
        2, 3,
        15, 16, 17,
        34, 35, 36, 37,
        59, 60, 61, 62, 63,
        90, 91, 92, 93, 94, 95,
        123, 124, 125, 126, 127, 128,
      ],
      "D66"
    ),

    // VVD (22)
    ...seats(
      [
        6, 7,
        21, 22, 23,
        42, 43, 44, 45,
        72, 73,
        102, 103,
        104, 105,
        133, 134, 135, 136, 137, 138, 139,
      ],
      "VVD"
    ),

    // PVV (26)
    ...seats(
      [
        10, 11,
        27, 28, 29,
        52, 53,
        78, 81, 82, 83,
        107, 108,
        112, 113,
        140, 141, 142, 143, 144, 145, 146, 147, 148, 149,
      ],
      "PVV"
    ),

    // CDA (18)
    ...seats(
      [
        4, 5,
        18, 19, 20,
        38, 39, 40, 41,
        67, 68,
        96, 97, 98,
        129, 130, 131, 132,
      ],
      "CDA"
    ),

    // JA21 (9)
    ...seats([8, 9, 24, 25, 26, 46, 47, 48, 49], "JA2"),

    // FvD (7)
    ...seats([50, 51, 79, 80, 109, 110, 111], "FVD"),

    // BBB (4)
    ...seats([74, 75, 76, 77], "BBB"),

    // DENK (3)
    ...seats([64, 65, 66], "DEN"),

    // SGP (3)
    ...seats([69, 70, 71], "SGP"),

    // PvdD (3)
    ...seats([120, 121, 122], "PVD"),

    // ChristenUnie (3)
    ...seats([99, 100, 101], "CHR"),

    // SP (3)
    ...seats([114, 115, 116], "SP"),

    // 50PLUS (2)
    ...seats([118, 119], "PLU"),

    // Volt (1)
    ...seats([89], "VOL"),
  ],
};

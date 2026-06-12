const fs = require("fs");
const path = require("path");

// --------------------
// 1️⃣ moties laden
// --------------------
const motiesPath = path.resolve(__dirname, "./moties.ts");

if (!fs.existsSync(motiesPath)) {
  console.error("❌ moties.ts niet gevonden:", motiesPath);
  process.exit(1);
}

const { moties } = require(motiesPath);

if (!Array.isArray(moties)) {
  console.error("❌ moties is geen array");
  process.exit(1);
}

// --------------------
// 2️⃣ helpers
// --------------------
function normalizeVoteType(type) {
  const t = (type || "").toLowerCase();
  if (t.includes("voor")) return "voor";
  if (t.includes("tegen")) return "tegen";
  return "onthouden";
}

// --------------------
// 3️⃣ partijen bouwen
// --------------------
const partijStemmen = new Map();
const uitvalMoties = [];

moties.forEach((motie) => {
  const stemmingen =
    motie.Besluit?.flatMap((b) => b.Stemmingen || []) || [];

  const verdeling = {};
  let totaalStemmen = 0;

  for (const s of stemmingen) {
    if (!s.ActorNaam || !s.FractieGrootte) continue;

    const naam = s.ActorNaam.trim();
    const soort = normalizeVoteType(s.Soort);

    if (!verdeling[naam]) {
      verdeling[naam] = { voor: 0, tegen: 0, onthouden: 0 };
    }

    verdeling[naam][soort] += s.FractieGrootte;
    totaalStemmen += s.FractieGrootte;
  }

  // ❗ 150 check blijft
  if (totaalStemmen !== 150) {
    uitvalMoties.push({
      id: motie.Id,
      title: motie.Onderwerp,
      totaalStemmen,
    });
    return;
  }

  for (const [naam, v] of Object.entries(verdeling)) {
    if (!partijStemmen.has(naam)) partijStemmen.set(naam, {});
    partijStemmen.get(naam)[motie.Id] = v;
  }
});

// --------------------
// 4️⃣ party config
// --------------------
const PARTY_HOUSE_STYLES = {
  VVD: "#0A2CCA",
  PVV: "#1A1A1A",
  NSC: "#6B4EFF",
  GL: "#00A651",
  PvdA: "#E30613",
  D66: "#00B3E3",
  CDA: "#007A33",
  SP: "#E11C2A",
  CU: "#009B77",
  PvdD: "#006A4E",
  FVD: "#7A0019",
  DENK: "#7B2CBF",
  SGP: "#F57C00",
  Volt: "#582C83",
  JA21: "#003366",
  BBB: "#5A8F29"
};

const nameToAbbr = {
  "Volkspartij voor Vrijheid en Democratie": "VVD",
  "Partij voor de Vrijheid": "PVV",
  "GroenLinks-PvdA": "GL",
  "DENK": "DENK",
  "D66": "D66",
  "CDA": "CDA",
  "SP": "SP",
  "CU": "CU",
  "PvdD": "PvdD",
  "FVD": "FVD",
  "Volt": "Volt",
  "JA21": "JA21",
  "BBB": "BBB",
};

// --------------------
// 5️⃣ build mockParties
// --------------------
let idCounter = 1;

const mockParties = Array.from(partijStemmen.entries()).map(([name, votes]) => {
  const abbr = nameToAbbr[name] ?? name.slice(0, 3).toUpperCase();

  const color =
    PARTY_HOUSE_STYLES[abbr] ||
    PARTY_HOUSE_STYLES[name] ||
    "#999999";

  return {
    id: idCounter++,
    name,
    abbreviation: abbr,
    color,
    votes,
  };
});

console.log(`📊 Partijen aangemaakt: ${mockParties.length}`);

// --------------------
// 6️⃣ schrijven (NIEUW BESTAND)
// --------------------
const outputDir = path.resolve(__dirname, "../voting-app-local/src/lib");

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(
  path.join(outputDir, "mockDataParties.ts"),
  `import type { Party } from "@shared/schema";

export const mockParties: Party[] = ${JSON.stringify(mockParties, null, 2)};
`,
  "utf-8"
);

// --------------------
// 7️⃣ uitval
// --------------------
if (uitvalMoties.length > 0) {
  fs.writeFileSync(
    path.join(outputDir, "uitval.ts"),
    `export const uitvalMoties = ${JSON.stringify(uitvalMoties, null, 2)};`,
    "utf-8"
  );

  console.log(`⚠️ ${uitvalMoties.length} moties in uitval.ts`);
}

console.log("✅ mockDataParties.ts aangemaakt!");
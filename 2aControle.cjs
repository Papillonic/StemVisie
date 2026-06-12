
/**
 * Update mockData.ts
 * ✅ Voegt alleen NIEUWE moties toe
 * ✅ Voegt stemmingen toe aan bestaande partijen
 * ✅ Maakt nieuwe partijen automatisch aan
 * ✅ simplified fallback
 * ✅ categorie fallback = "Nog te bepalen"
 */

const fs = require("fs");
const path = require("path");

// --------------------
// 1️⃣ Paths
// --------------------
const motiesPath = path.resolve(__dirname, "./moties.ts");

const mockDataPath = path.resolve(
  __dirname,
  "../voting-app-local/src/lib/mockData.ts"
);

// --------------------
// 2️⃣ moties.ts laden
// --------------------
if (!fs.existsSync(motiesPath)) {
  console.error("❌ moties.ts niet gevonden");
  process.exit(1);
}

const imported = require(motiesPath);
const moties = imported.moties;

if (!Array.isArray(moties)) {
  console.error("❌ moties is geen array");
  process.exit(1);
}

// --------------------
// 3️⃣ bestaande mockData laden
// --------------------
let existingAmendments = [];
let existingParties = [];

if (fs.existsSync(mockDataPath)) {

  const content = fs.readFileSync(
    mockDataPath,
    "utf-8"
  );

  // mockAmendments
  const amendMatch = content.match(
    /export const mockAmendments: Amendment\[\] = (\[[\s\S]*?\]);/
  );

  // mockParties
  const partyMatch = content.match(
    /export const mockParties: Party\[\] = (\[[\s\S]*?\]);/
  );

  if (amendMatch) {
    existingAmendments = JSON.parse(
      amendMatch[1]
    );
  }

  if (partyMatch) {
    existingParties = JSON.parse(
      partyMatch[1]
    );
  }

  console.log(
    "📦 Bestaande data geladen: ${existingAmendments.length} moties"
  );

} else {

  console.log(
    "ℹ️ Geen bestaande mockData.ts gevonden"
  );
}

// --------------------
// 4️⃣ snelle lookup
// --------------------
const existingIds = new Set(
  existingAmendments.map(m => m.id)
);

// partij lookup
const partyMap = new Map();

existingParties.forEach(p => {
  partyMap.set(p.name, p);
});

// --------------------
// 5️⃣ helper
// --------------------
function extractCoreText(text) {

  if (!text) {
    return "Geen beschrijving beschikbaar.";
  }

  const startMatch = text.match(
    /(constaterende[\s\S]*)/i
  );

  if (!startMatch) {
    return text.trim();
  }

  let core = startMatch[1];

  core = core.split(
    /en gaat over tot de orde van de dag/i
  )[0];

  return core.trim();
}

// --------------------
// 6️⃣ kleuren + afkortingen
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
  "DENK": "DEN",
  "SGP": "SGP",
  "GroenLinks-PvdA": "GRO",
  "D66": "D66",
  "CDA": "CDA",
  "SP": "SP",
  "CU": "CHR",
  "PvdD": "PVD",
  "FVD": "FVD",
  "Volt": "VOL",
  "JA21": "JA2",
  "BBB": "BBB",
};

// --------------------
// 7️⃣ verwerken
// --------------------
const nieuweMoties = [];
const uitvalMoties = [];

let nextPartyId =
  existingParties.length > 0
    ? Math.max(
        ...existingParties.map(p => p.id)
      ) + 1
    : 1;

for (const motie of moties) {

  // overslaan indien al aanwezig
  if (existingIds.has(motie.Id)) {
    continue;
  }

  const ks = motie.Kamerstukken?.[0];

  const fullText =
    ks?.PdfText ||
    motie.Onderwerp ||
    "Geen beschrijving beschikbaar.";

  const description =
    extractCoreText(fullText);

  const fullDescription = fullText;

  // simplified fallback
  const simplified =
    ks?.EenvoudigeTekst
      ?.replace(/^===\s*/g, "")
      .trim()
    || "Nog geen vereenvoudigde uitleg beschikbaar.";

  // categorie fallback
  const categorie =
    ks?.Categorie
    || motie.Kamerstukdossier?.[0]?.Categorie
    || ["Nog te bepalen"];

  // stemmen
  const stemmingen =
    motie.Besluit?.flatMap(
      b => b.Stemmingen || []
    ) || [];

  const verdelingPerMotie = {};

  let totaalStemmen = 0;

  for (const s of stemmingen) {

    if (
      !s.ActorNaam ||
      !s.FractieGrootte
    ) {
      continue;
    }

    const naam =
      s.ActorNaam.trim();

    const soort =
      (
        s.Soort ||
        "onthouden"
      ).toLowerCase();

    if (!verdelingPerMotie[naam]) {

      verdelingPerMotie[naam] = {
        voor: 0,
        tegen: 0,
        onthouden: 0
      };
    }

    verdelingPerMotie[naam][soort] +=
      s.FractieGrootte;

    totaalStemmen +=
      s.FractieGrootte;
  }

  // controle 150 stemmen
  if (totaalStemmen !== 150) {

    uitvalMoties.push({
      id: motie.Id,
      title: motie.Onderwerp,
      totaalStemmen
    });

    continue;
  }

  // indieners
  const indieners =
    motie.ZaakActor
      ?.filter(
        a => a.ActorNaam !== "TK"
      )
      .map(a => ({
        naam:
          a.ActorNaam?.trim(),
        fractie:
          a.ActorFractie
      })) || [];

  // amendment toevoegen
  nieuweMoties.push({
    id: motie.Id,
    title: motie.Onderwerp,
    description,
    fullDescription,
    simplified,
    Soort:
      motie.Soort || "Motie",
    Categorie: categorie,
    stemDatum:
      motie.Besluit?.[0]
        ?.GewijzigdOp || null,
    indieners
  });

  // --------------------
  // partijstemmen verwerken
  // --------------------
  for (const [
    partijNaam,
    votes
  ] of Object.entries(
    verdelingPerMotie
  )) {

    // nieuwe partij aanmaken
    if (!partyMap.has(partijNaam)) {

      const abbr =
        nameToAbbr[partijNaam]
        || partijNaam
          .slice(0, 3)
          .toUpperCase();

      const color =
        PARTY_HOUSE_STYLES[abbr]
        || "#999999";

      const nieuwePartij = {
        id: nextPartyId++,
        name: partijNaam,
        abbreviation: abbr,
        color,
        votes: {}
      };

      existingParties.push(
        nieuwePartij
      );

      partyMap.set(
        partijNaam,
        nieuwePartij
      );
    }

    // stemmen toevoegen
    const partij =
      partyMap.get(partijNaam);

    partij.votes[motie.Id] =
      votes;
  }
}

// --------------------
// 8️⃣ amendments samenvoegen
// --------------------
const finalAmendments = [
  ...existingAmendments,
  ...nieuweMoties
];

// --------------------
// 9️⃣ schrijven
// --------------------
const output = `
import type { Amendment, Party } from "@shared/schema";

export const mockAmendments: Amendment[] = ${JSON.stringify(
  finalAmendments,
  null,
  2
)};

export const mockParties: Party[] = ${JSON.stringify(
  existingParties,
  null,
  2
)};
`;

fs.writeFileSync(
  mockDataPath,
  output,
  "utf-8"
);

// --------------------
// 🔟 uitval schrijven
// --------------------
if (uitvalMoties.length > 0) {

  const uitvalPath = path.resolve(
    __dirname,
    "../voting-app-local/src/lib/uitval.ts"
  );

  fs.writeFileSync(
    uitvalPath,
    `export const uitvalMoties = ${JSON.stringify(
      uitvalMoties,
      null,
      2
    )};`,
    "utf-8"
  );

  console.log(
    `⚠️ ${uitvalMoties.length} moties in uitval.ts`
  );
}

console.log(
  `✅ ${nieuweMoties.length} nieuwe moties toegevoegd`
);

console.log(
  "🎉 mockData.ts bijgewerkt"
);

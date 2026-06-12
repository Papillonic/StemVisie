/**
 * Zet moties.ts om naar client/src/lib/mockData.ts
 * ✔ Gebruikt echte motie-id's
 * ✔ Verwerkt ALLE moties en ALLE partijen
 * ✔ Houdt volledige PDF-tekst exact intact
 * ✔ Voegt vereenvoudigde teksten toe
 */

const fs = require("fs");
const path = require("path");

// 1️⃣ Pad naar moties.ts
const motiesPath = path.resolve(__dirname, "../moties.ts");
if (!fs.existsSync(motiesPath)) {
  console.error("❌ moties.ts niet gevonden!");
  process.exit(1);
}

// 2️⃣ Importeer moties
let moties;
try {
  const imported = require(motiesPath);
  moties = imported.moties;
  if (!Array.isArray(moties)) throw new Error("moties is geen array");
} catch (err) {
  console.error("❌ Kon moties.ts niet importeren:", err);
  process.exit(1);
}

// 3️⃣ Lees vereenvoudigde teksten
const vereenvoudigdPath = path.resolve(__dirname, "../motietekstenterug.txt");
if (!fs.existsSync(vereenvoudigdPath)) {
  console.error("❌ motietekstenterug.txt niet gevonden!");
  process.exit(1);
}
const txtContent = fs.readFileSync(vereenvoudigdPath, "utf-8");
const vereenvoudigdMap = {};
const blocks = txtContent.split(/=== MOTIE (.*?) ===/gs).slice(1);
for (let i = 0; i < blocks.length; i += 2) {
  const id = blocks[i].trim();
  const tekst = blocks[i + 1] ?? "";
  if (id && tekst) vereenvoudigdMap[id] = tekst;
}

// Helper: vind fulltext veld
function findFullTextInObject(obj) {
  if (!obj || typeof obj !== "object") return null;
  const exactCandidates = [
    "PdfFullText", "PdfFulltext", "PdfFulltekst",
    "PdfTextFull", "FullPdfText", "FullText",
    "PdfCompleteText", "PdfTextComplete", "FullTextPdf"
  ];
  for (const k of exactCandidates) {
    if (Object.prototype.hasOwnProperty.call(obj, k)) {
      const val = obj[k];
      if (typeof val === "string" && val.length > 0) return val;
    }
  }
  const keyPattern = /(pdf.*full.*text|full.*pdf.*text|pdffulltext|fulltext|pdftextfull|full.*text)/i;
  for (const key of Object.keys(obj)) {
    if (keyPattern.test(key)) {
      const val = obj[key];
      if (typeof val === "string" && val.length > 0) return val;
    }
  }
  return null;
}

// 4️⃣ Bouw datasets op
const mockAmendments = [];
const partijStemmen = new Map(); // Map<partijNaam, { [motieId]: vote }>

moties.forEach((motie) => {
  const description = motie.Kamerstukken?.[0]?.PdfText || motie.Onderwerp || "Geen beschrijving beschikbaar.";

  let fullDescription = null;
  if (Array.isArray(motie.Kamerstukken)) {
    for (const ks of motie.Kamerstukken) {
      const found = findFullTextInObject(ks);
      if (found) { fullDescription = found; break; }
    }
  }
  if (!fullDescription) fullDescription = findFullTextInObject(motie);
  if (!fullDescription) fullDescription = description;

  const simplified = vereenvoudigdMap[motie.Id] || "Geen vereenvoudigde tekst beschikbaar.";

  mockAmendments.push({
    id: motie.Id, // ✅ echte id gebruiken
    title: motie.Onderwerp,
    description,
    fullDescription,
    simplified,
    category: "Motie",
  });

  const stemmingen = motie.Besluit?.flatMap(b => b.Stemmingen || []) || [];
  for (const s of stemmingen) {
    if (!s.ActorNaam) continue;
    const naam = s.ActorNaam.trim();
    if (!partijStemmen.has(naam)) {
      partijStemmen.set(naam, {}); // leeg object ipv array
    }
    const votes = partijStemmen.get(naam);
    votes[motie.Id] = s.Soort?.toLowerCase() || "onthouden"; // ✅ id-gebaseerde key
  }
});

// 5️⃣ Maak partij-objecten
let idCounter = 1;
const mockParties = Array.from(partijStemmen.entries()).map(([name, votes]) => ({
  id: idCounter++,
  name,
  abbreviation: name.slice(0, 3).toUpperCase(),
  color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`,
  votes, // object met motie-id => stem
}));

// 6️⃣ Schrijf mockData.ts
const outputDir = path.resolve(__dirname, "../client/src/lib");
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

const outputPath = path.join(outputDir, "mockData.ts");
const output = `import type { Amendment, Party } from "@shared/schema";

export const mockAmendments: Amendment[] = ${JSON.stringify(mockAmendments, null, 2)};
export const mockParties: Party[] = ${JSON.stringify(mockParties, null, 2)};
`;

fs.writeFileSync(outputPath, output, "utf-8");
console.log("✅ mockData.ts aangemaakt met echte motie-id's en partijen!");

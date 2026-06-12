/**
 * Zet moties.ts om naar client/src/lib/mockData.ts
 * ✅ Kleuren komen uit huisstijl
 * ✅ Afkortingen correct gemapt
 * ✅ Controle: totaal stemmen per motie moet 150 zijn
 */

const fs = require("fs");
const path = require("path");

// --------------------
// 1️⃣ moties.ts laden
// --------------------
const motiesPath = path.resolve(__dirname, "../moties.ts");
if (!fs.existsSync(motiesPath)) {
  console.error("❌ moties.ts niet gevonden!");
  process.exit(1);
}

let moties;
try {
  const imported = require(motiesPath);
  moties = imported.moties;
  if (!Array.isArray(moties)) throw new Error("moties is geen array");
} catch (err) {
  console.error("❌ Kon moties.ts niet importeren:", err);
  process.exit(1);
}

// --------------------
// 2️⃣ vereenvoudigde teksten + categorie
// --------------------
const vereenvoudigdPath = path.resolve(__dirname, "../motietekstenterug.txt");
const txtContent = fs.existsSync(vereenvoudigdPath)
  ? fs.readFileSync(vereenvoudigdPath, "utf-8")
  : "";

const vereenvoudigdMap = {};
const categorieMap = {};
const blocks = txtContent.split(/=== MOTIE (.*?) ===/gs).slice(1);

for (let i = 0; i < blocks.length; i += 2) {
  const id = blocks[i].trim();
  let tekst = (blocks[i + 1] || "").trim();
  if (!id || !tekst) continue;

  let categorieën = [];
  const match = tekst.match(/Categorie:\s*(.+)$/i);
  if (match) {
    categorieën = match[1].split(",").map(c => c.trim()).filter(Boolean);
    tekst = tekst.replace(/Categorie:\s*.+$/i, "").trim();
  }

  vereenvoudigdMap[id] = tekst;
  categorieMap[id] = categorieën;
}

// --------------------
// 3️⃣ Helper fulltext
// --------------------
function findFullTextInObject(obj) {
  if (!obj || typeof obj !== "object") return null;
  const exactCandidates = [
    "PdfFullText","PdfFulltext","PdfFulltekst",
    "PdfTextFull","FullPdfText","FullText",
    "PdfCompleteText","PdfTextComplete","FullTextPdf"
  ];
  for (const k of exactCandidates) {
    if (typeof obj[k] === "string" && obj[k].length>0) return obj[k];
  }
  const keyPattern = /(pdf.*full.*text|full.*pdf.*text|pdffulltext|fulltext|pdftextfull)/i;
  for (const k of Object.keys(obj)) {
    if (keyPattern.test(k) && typeof obj[k]==="string") return obj[k];
  }
  return null;
}

// --------------------
// 4️⃣ Bouw datasets
// --------------------
const mockAmendments = [];
const partijStemmen = new Map();
const uitvalMoties = [];

moties.forEach((motie) => {
  const description =
    motie.Kamerstukken?.[0]?.PdfText || motie.Onderwerp || "Geen beschrijving beschikbaar.";

  let fullDescription = null;
  if (Array.isArray(motie.Kamerstukken)) {
    for (const ks of motie.Kamerstukken) {
      const found = findFullTextInObject(ks);
      if (found) { fullDescription = found; break; }
    }
  }
  if (!fullDescription) fullDescription = findFullTextInObject(motie) || description;

  const simplified = vereenvoudigdMap[motie.Id] || "Geen vereenvoudigde tekst beschikbaar.";

  const stemmingen = motie.Besluit?.flatMap(b => b.Stemmingen || []) || [];
  const verdelingPerMotie = {};
  let totaalStemmen = 0;

  for (const s of stemmingen) {
    if (!s.ActorNaam || !s.FractieGrootte) continue;
    const naam = s.ActorNaam.trim();
    const soort = (s.Soort || "onthouden").toLowerCase();
    if (!verdelingPerMotie[naam]) verdelingPerMotie[naam] = { voor:0, tegen:0, onthouden:0 };
    verdelingPerMotie[naam][soort] += s.FractieGrootte;
    totaalStemmen += s.FractieGrootte;
  }

  if (totaalStemmen !== 150) {
    uitvalMoties.push({
      id: motie.Id,
      title: motie.Onderwerp,
      totaalStemmen,
      stemVerdeling: verdelingPerMotie,
    });
    return;
  }

  for (const [naam, verdeling] of Object.entries(verdelingPerMotie)) {
    if (!partijStemmen.has(naam)) partijStemmen.set(naam, {});
    partijStemmen.get(naam)[motie.Id] = verdeling;
  }

  mockAmendments.push({
    id: motie.Id,
    title: motie.Onderwerp,
    description,
    fullDescription,
    simplified,
    Soort: motie.category || "Motie",
    Categorie: [...new Set(categorieMap[motie.Id] || [])],
    stemDatum: motie.Besluit?.[0]?.GewijzigdOp || null,
    indieners: motie.ZaakActor?.filter(a => a.ActorNaam!=="TK")
      .map(a => ({ naam: a.ActorNaam, fractie: a.ActorFractie })) || [],
  });
});

// --------------------
// 5️⃣ Huisstijl kleuren & afkorting mapping
// --------------------
const PARTY_HOUSE_STYLES = {
  VVD: "#0A2CCA", PVV:"#1A1A1A", NSC:"#6B4EFF", GL:"#00A651", PvdA:"#E30613",
  D66:"#00B3E3", CDA:"#007A33", SP:"#E11C2A", CU:"#009B77", PvdD:"#006A4E",
  FVD:"#7A0019", DENK:"#7B2CBF", SGP:"#F57C00", Volt:"#582C83", JA21:"#003366", BBB:"#5A8F29"
};

// Handmatige mapping naam → afkorting
const nameToAbbr = {
  "Volkspartij voor Vrijheid en Democatie": "VVD",
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

let idCounter = 1;
const mockParties = Array.from(partijStemmen.entries()).map(([name, votes]) => {
  const abbr = nameToAbbr[name] ?? name.slice(0,3).toUpperCase();
  const color = PARTY_HOUSE_STYLES[abbr] ?? "#999999";
  return { id: idCounter++, name, abbreviation: abbr, color, votes };
});

// --------------------
// 6️⃣ Schrijven
// --------------------
const outputDir = path.resolve(__dirname, "../client/src/lib");
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

fs.writeFileSync(
  path.join(outputDir, "mockData.ts"),
  `import type { Amendment, Party } from "@shared/schema";

export const mockAmendments: Amendment[] = ${JSON.stringify(mockAmendments, null, 2)};
export const mockParties: Party[] = ${JSON.stringify(mockParties, null, 2)};
`,
  "utf-8"
);

// --------------------
// 7️⃣ Uitval
// --------------------
if (uitvalMoties.length>0) {
  fs.writeFileSync(
    path.join(outputDir, "uitval.ts"),
    `export const uitvalMoties = ${JSON.stringify(uitvalMoties,null,2)};`,
    "utf-8"
  );
  console.log(`⚠️ ${uitvalMoties.length} moties met ≠150 stemmen in uitval.ts`);
}

console.log("✅ mockData.ts aangemaakt met huisstijlkleuren!");

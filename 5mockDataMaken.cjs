const fs = require("fs");
const path = require("path");

// --------------------
// 1️⃣ moties.ts laden
// --------------------
const motiesPath = path.resolve(__dirname, "./moties.ts");

if (!fs.existsSync(motiesPath)) {
  console.error("❌ moties.ts niet gevonden:", motiesPath);
  process.exit(1);
}

const imported = require(motiesPath);
const moties = imported.moties;

if (!Array.isArray(moties)) {
  console.error("❌ moties is geen array");
  process.exit(1);
}

// --------------------
// 2️⃣ helper: kern van tekst extraheren
// --------------------
function extractCoreText(text) {
  if (!text) return "Geen beschrijving beschikbaar.";

  const startMatch = text.match(/(constaterende[\s\S]*)/i);
  if (!startMatch) return text.trim();

  let core = startMatch[1];

  core = core.split(/en gaat over tot de orde van de dag/i)[0];

  return core.trim();
}

// --------------------
// 3️⃣ verwerken
// --------------------
const mockAmendments = [];
const partijStemmen = new Map();
const uitvalMoties = [];

moties.forEach((motie) => {
  const ks = motie.Kamerstukken?.[0];

  const fullText =
    ks?.PdfText ||
    motie.Onderwerp ||
    "Geen beschrijving beschikbaar.";

  const description = extractCoreText(fullText);
  const fullDescription = fullText;

  const simplified =
    ks?.EenvoudigeTekst?.replace(/^===\s*/g, "").trim() ||
    "Geen vereenvoudigde tekst beschikbaar.";

  // 🗳️ stemmen
  const stemmingen =
    motie.Besluit?.flatMap((b) => b.Stemmingen || []) || [];

  const verdelingPerMotie = {};
  let totaalStemmen = 0;

  for (const s of stemmingen) {
    if (!s.ActorNaam || !s.FractieGrootte) continue;

    const naam = s.ActorNaam.trim();
    const soort = (s.Soort || "onthouden").toLowerCase();

    if (!verdelingPerMotie[naam]) {
      verdelingPerMotie[naam] = { voor: 0, tegen: 0, onthouden: 0 };
    }

    verdelingPerMotie[naam][soort] += s.FractieGrootte;
    totaalStemmen += s.FractieGrootte;
  }

  // ❗ check (optioneel, kan je aanpassen)
  if (totaalStemmen !== 150) {
    uitvalMoties.push({
      id: motie.Id,
      title: motie.Onderwerp,
      totaalStemmen,
    });
    return;
  }

  // 🆕 indieners
  const indieners =
    motie.ZaakActor?.map((a) => ({
      naam: a.ActorNaam?.trim(),
      fractie: a.ActorFractie,
    })) || [];

  // 🆕 categorie → ALTIJD STRING
  const rawCategorie =
    ks?.Categorie ||
    motie.Kamerstukdossier?.[0]?.Categorie;

  let categorie = "Onbekend";

  if (Array.isArray(rawCategorie)) {
    categorie = rawCategorie[0] || "Onbekend";
  } else if (typeof rawCategorie === "string") {
    categorie = rawCategorie;
  }

  categorie = categorie.trim();

  // partijen opslaan
  for (const [naam, verdeling] of Object.entries(verdelingPerMotie)) {
    if (!partijStemmen.has(naam)) partijStemmen.set(naam, {});
    partijStemmen.get(naam)[motie.Id] = verdeling;
  }

  // 📦 eindobject (exact zoals jij wilt)
  mockAmendments.push({
    id: motie.Id,
    title: motie.Onderwerp,
    description,
    fullDescription,
    simplified,
    Soort: motie.Soort || "Motie",
    Categorie: categorie, // ✅ STRING
    stemDatum: motie.Besluit?.[0]?.GewijzigdOp || null,
    indieners,
  });
});

// --------------------
// 4️⃣ output map
// --------------------
const outputDir = path.resolve(__dirname, "../voting-app-local/src/lib");

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log("📁 Map aangemaakt:", outputDir);
}

// --------------------
// 5️⃣ schrijven
// --------------------
fs.writeFileSync(
  path.join(outputDir, "mockData.ts"),
  `import type { Amendment, Party } from "@shared/schema";

export const mockAmendments: Amendment[] = ${JSON.stringify(
    mockAmendments,
    null,
    2
  )};

export const mockParties: Party[] = [];
`,
  "utf-8"
);

console.log("✅ mockData.ts aangemaakt");

// --------------------
// 6️⃣ uitval
// --------------------
if (uitvalMoties.length > 0) {
  fs.writeFileSync(
    path.join(outputDir, "uitval.ts"),
    `export const uitvalMoties = ${JSON.stringify(uitvalMoties, null, 2)};`,
    "utf-8"
  );

  console.log(`⚠️ ${uitvalMoties.length} moties in uitval.ts`);
}

console.log("🎉 Klaar!");
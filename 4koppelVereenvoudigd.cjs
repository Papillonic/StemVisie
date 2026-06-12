const fs = require("fs");
const path = require("path");

// Bestanden
const MOTIES_TS = "moties.ts";
const BATCH_DIR = "batches_uitvoer";
const OUTPUT_TS = "moties.ts";

// Debug opslag
const unmatchedBlokken = [];
const unparsableBlokken = [];

// 1️⃣ batches inlezen
const bestanden = fs.readdirSync(BATCH_DIR);

const batchBestanden = bestanden.filter(file =>
  /^batch\d+_uitvoer/.test(file)
);

const eenvoudigeTeksten = {};

// 🔹 robuuste parser
function parseBlok(blok) {
  const idMatch = blok.match(/^([^\s=\n]+)/);
  if (!idMatch) return null;

  const id = idMatch[1].trim();

  let rest = blok.replace(/^([^\s=\n]+)/, "").trim();

  const categorieSplit = rest.split(/Categorie:/i);

  let tekst = categorieSplit[0].trim();
  let categorie = categorieSplit[1] ? categorieSplit[1].trim() : null;

  // cleanup
  tekst = tekst.replace(/Samenvatting:\s*/i, "").trim();

  if (categorie) {
    categorie = categorie
      .replace(/^=+/, "")
      .replace(/=+$/, "")
      .trim();
  }

  return { id, tekst, categorie, blok };
}

// 2️⃣ batches verwerken
let totaalBlokken = 0;

for (const bestand of batchBestanden) {
  const pad = path.join(BATCH_DIR, bestand);
  const txt = fs.readFileSync(pad, "utf-8");

  const blokken = txt.split(/=== MOTIE /).slice(1);
  totaalBlokken += blokken.length;

  for (const blok of blokken) {
    const parsed = parseBlok(blok);

    if (!parsed) {
      unparsableBlokken.push(blok);
      continue;
    }

    const { id, tekst, categorie } = parsed;

    eenvoudigeTeksten[id] = { tekst, categorie, blok };
  }
}

console.log(`\n📦 Totaal blokken gevonden: ${totaalBlokken}`);
console.log(`📦 Unieke IDs uit batches_uitvoer: ${Object.keys(eenvoudigeTeksten).length}`);

// 3️⃣ moties.ts inlezen
let tsContent = fs.readFileSync(MOTIES_TS, "utf-8");

const jsonMatch = tsContent.match(/export const moties = (\[.*\]);/s);

if (!jsonMatch) {
  console.error("❌ Kon moties-array niet vinden");
  process.exit(1);
}

let moties = JSON.parse(jsonMatch[1]);

// 4️⃣ koppelen
let matched = 0;
const ontbrekendeIds = [];

const batchIds = Object.keys(eenvoudigeTeksten);
const motieIds = moties.map(m => m.Id);

for (const motie of moties) {
  const id = motie.Id;
  const data = eenvoudigeTeksten[id];

  if (data) {
    matched++;
  } else {
    ontbrekendeIds.push(id);
  }

  if (motie.Kamerstukken) {
    for (const stuk of motie.Kamerstukken) {
      stuk.EenvoudigeTekst = data
        ? data.tekst
        : "(geen eenvoudige tekst gevonden)";
      stuk.Categorie = data ? data.categorie : null;
    }
  }

  delete motie.EenvoudigeTekst;
}

// 5️⃣ extra IDs
const extraBatchIds = batchIds.filter(id => !motieIds.includes(id));

// 6️⃣ verzamel unmatched blokken
for (const id of ontbrekendeIds) {
  const blokData = eenvoudigeTeksten[id];
  if (blokData && blokData.blok) {
    unmatchedBlokken.push(blokData.blok);
  }
}

// 7️⃣ logging
console.log(`\n📊 RESULTAAT`);
console.log(`✅ Gematcht: ${matched}`);
console.log(`❌ Ontbrekend: ${ontbrekendeIds.length}`);
console.log(`⚠️ Extra: ${extraBatchIds.length}`);
console.log(`🚨 Niet parsebaar: ${unparsableBlokken.length}`);

// 🔴 unparsable blokken tonen
if (unparsableBlokken.length > 0) {
  console.log(`\n🚨 BLOKKEN DIE NIET GEPARSED KONDEN WORDEN:\n`);

  unparsableBlokken.slice(0, 5).forEach((blok, i) => {
    console.log(`--- BLOK ${i + 1} ---`);
    console.log(blok.slice(0, 500));
    console.log("\n");
  });
}

// 🔴 unmatched blokken tonen
if (unmatchedBlokken.length > 0) {
  console.log(`\n⚠️ BLOKKEN ZONDER MATCH:\n`);

  unmatchedBlokken.slice(0, 5).forEach((blok, i) => {
    console.log(`--- BLOK ${i + 1} ---`);
    console.log(blok.slice(0, 500));
    console.log("\n");
  });
}

// 8️⃣ optioneel: naar files schrijven (aanrader)
fs.writeFileSync(
  "unparsable.txt",
  unparsableBlokken.join("\n\n====================\n\n")
);

fs.writeFileSync(
  "unmatched.txt",
  unmatchedBlokken.join("\n\n====================\n\n")
);

// 9️⃣ opslaan moties.ts
const nieuweContent = `export const moties = ${JSON.stringify(moties, null, 2)};\n`;

fs.writeFileSync(OUTPUT_TS, nieuweContent, "utf-8");

console.log("\n✅ moties.ts succesvol bijgewerkt");
console.log("📄 Debug bestanden geschreven: unparsable.txt & unmatched.txt");
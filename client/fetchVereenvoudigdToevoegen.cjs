// combineMoties.cjs
const fs = require("fs");

// Bestanden
const MOTIES_TS = "moties.ts";
const MOTIE_TXT = "motietekstenterug.txt";
const OUTPUT_TS = "moties.ts";

// 1️⃣ motietekstenterug.txt inlezen
const txt = fs.readFileSync(MOTIE_TXT, "utf-8");

// Elke motie begint met "=== MOTIE {id} ==="
const blokken = txt.split(/=== MOTIE /).slice(1);
const eenvoudigeTeksten = {};

for (const blok of blokken) {
  const [id, ...rest] = blok.split(" ===");
  const volledigeTekst = rest.join(" ===").trim();

  // Splitsen bij "Categorie:"
  const categorieSplit = volledigeTekst.split(/Categorie:/i);
  const tekst = categorieSplit[0].trim(); // alles voor "Categorie:" is vereenvoudigde tekst
  const categorie = categorieSplit[1] ? categorieSplit[1].trim() : null; // alles na "Categorie:" als tag

  eenvoudigeTeksten[id.trim()] = { tekst, categorie };
}

// 2️⃣ moties.ts inlezen en parsen
let tsContent = fs.readFileSync(MOTIES_TS, "utf-8");
const jsonMatch = tsContent.match(/export const moties = (\[.*\]);/s);
if (!jsonMatch) {
  console.error("❌ Kon moties-array niet vinden in moties.ts");
  process.exit(1);
}

let moties = JSON.parse(jsonMatch[1]);

// 3️⃣ koppelen van eenvoudige teksten en categorie binnen elk Kamerstuk
for (const motie of moties) {
  const id = motie.Id;
  const data = eenvoudigeTeksten[id] || { tekst: "(geen eenvoudige tekst gevonden)", categorie: null };

  // Voeg tekst en categorie toe binnen alle Kamerstukken
  if (motie.Kamerstukken && motie.Kamerstukken.length > 0) {
    for (const stuk of motie.Kamerstukken) {
      stuk.EenvoudigeTekst = data.tekst;
      stuk.Categorie = data.categorie; // nieuwe tag
    }
  }

  // Verwijder eventueel bestaande top-level EenvoudigeTekst
  delete motie.EenvoudigeTekst;
}

// 4️⃣ opnieuw schrijven naar moties.ts
const nieuweContent = `export const moties = ${JSON.stringify(moties, null, 2)};\n`;
fs.writeFileSync(OUTPUT_TS, nieuweContent, "utf-8");

console.log("✅ moties.ts bijgewerkt: EenvoudigeTekst en Categorie nu binnen Kamerstukken geplaatst.");

const fs = require("fs");
const path = require("path");

// Map en output
const BATCH_DIR = "batches_uitvoer";
const OUTPUT_FILE = "alle_batches_uitvoer.txt";

// 1️⃣ bestanden ophalen
const bestanden = fs.readdirSync(BATCH_DIR);

// 2️⃣ filter + sorteer
const batchBestanden = bestanden
  .filter(file => /^batch\d+_uitvoer/.test(file))
  .sort((a, b) => {
    const numA = parseInt(a.match(/\d+/)[0], 10);
    const numB = parseInt(b.match(/\d+/)[0], 10);
    return numA - numB;
  });

// 3️⃣ tracking voor IDs
const idCounts = {};
const dubbeleIds = new Set();

// helper om ID's uit blok te halen
function verwerkInhoud(txt) {
  const blokken = txt.split(/=== MOTIE /).slice(1);

  for (const blok of blokken) {
    const [id] = blok.split(" ===");
    if (!id) continue;

    const cleanId = id.trim();

    if (idCounts[cleanId]) {
      idCounts[cleanId]++;
      dubbeleIds.add(cleanId);
    } else {
      idCounts[cleanId] = 1;
    }
  }
}

// 4️⃣ samenvoegen + analyseren
let gecombineerdeTekst = "";

for (const bestand of batchBestanden) {
  const pad = path.join(BATCH_DIR, bestand);
  const inhoud = fs.readFileSync(pad, "utf-8");

  verwerkInhoud(inhoud);

  gecombineerdeTekst += `\n\n===== ${bestand} =====\n\n`;
  gecombineerdeTekst += inhoud;
}

// 5️⃣ schrijven output
fs.writeFileSync(OUTPUT_FILE, gecombineerdeTekst, "utf-8");

// 6️⃣ statistieken
const totaal = Object.keys(idCounts).length;
const uniekeIds = Object.keys(idCounts);
const aantalDubbeleIds = dubbeleIds.size;

console.log(`\n📊 Statistieken:`);
console.log(`🔢 Totaal unieke IDs: ${totaal}`);
console.log(`⚠️ Aantal dubbele IDs: ${aantalDubbeleIds}`);

if (aantalDubbeleIds > 0) {
  console.log(`\n❌ Dubbele IDs:`);
  for (const id of dubbeleIds) {
    console.log(`- ${id} (komt ${idCounts[id]}x voor)`);
  }
}

console.log(`\n✅ Alle batches samengevoegd in ${OUTPUT_FILE}`);
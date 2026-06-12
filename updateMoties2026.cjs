/**
 * updateMoties2026.cjs
 * Haalt alle nieuwe moties van 2026 op en voegt ze toe aan moties.ts
 */

const https = require("https");
const fs = require("fs");
const path = require("path");

const BASE_URL = "https://gegevensmagazijn.tweedekamer.nl/OData/v4/2.0";
const BEGIN_DATUM = "2026-01-01";
const EIND_DATUM = "2026-12-31";

const MOTIES_TS = path.resolve(__dirname, "moties.ts");

// --------------------
// Helper: bestaande moties laden
// --------------------
let bestaandeMoties = [];
let bestaandeIds = new Set();

if (fs.existsSync(MOTIES_TS)) {
  const content = fs.readFileSync(MOTIES_TS, "utf-8");
  const match = content.match(/export const moties = (\[.*\]);/s);

  if (match) {
    bestaandeMoties = JSON.parse(match[1]);
    bestaandeIds = new Set(bestaandeMoties.map(m => m.Id));
    console.log(`ℹ️  ${bestaandeMoties.length} bestaande moties geladen uit moties.ts`);
  }
}

// --------------------
// Helper: OData fetch
// --------------------
async function fetchData(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {

      let data = "";

      res.on("data", chunk => data += chunk);

      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (err) {
            reject(err);
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        }
      });

    }).on("error", reject);
  });
}

// --------------------
// Fetch alle nieuwe moties met pagination
// --------------------
async function fetchNieuweMoties() {

  const nieuweMoties = [];
  let skip = 0;
  const pageSize = 100;

  while (true) {

    const url = `${BASE_URL}/Zaak?$top=${pageSize}&$skip=${skip}` +
      `&$filter=Soort eq 'Motie' and GewijzigdOp ge ${BEGIN_DATUM}T00:00:00Z` +
      ` and GewijzigdOp le ${EIND_DATUM}T23:59:59Z` +
      `&$select=Id,Nummer,Soort,Onderwerp,Volgnummer,Besluit,Stemming` +
      `&$expand=ZaakActor($select=ActorNaam,ActorFractie),Kamerstukdossier($select=Nummer,Toevoeging)`;

    const data = await fetchData(url);

    if (!data.value || data.value.length === 0) break;

    const filtered = data.value.filter(m => !bestaandeIds.has(m.Id));

    nieuweMoties.push(...filtered);

    skip += pageSize;

    console.log(`✅ ${nieuweMoties.length} nieuwe moties gevonden...`);
  }

  return nieuweMoties;
}

// --------------------
// Motie statistieken
// --------------------
function toonMotieStatistieken(moties) {

  let metStemming = 0;
  let zonderStemming = 0;

  let ingetrokken = 0;
  let aangehouden = 0;
  let overgenomen = 0;
  let overig = 0;

  moties.forEach(m => {

    const heeftStemming = m.Stemming && m.Stemming.length > 0;

    if (heeftStemming) {
      metStemming++;
    } else {

      zonderStemming++;

      const besluit = (m.Besluit || "").toLowerCase();

      if (besluit.includes("ingetrokken")) ingetrokken++;
      else if (besluit.includes("aangehouden")) aangehouden++;
      else if (besluit.includes("overgenomen")) overgenomen++;
      else overig++;

    }

  });

  console.log("\n📊 Motie statistieken");

  console.log(`Moties met stemming: ${metStemming}`);
  console.log(`Moties zonder stemming: ${zonderStemming}`);

  console.log(`  ├─ ingetrokken: ${ingetrokken}`);
  console.log(`  ├─ aangehouden: ${aangehouden}`);
  console.log(`  ├─ overgenomen: ${overgenomen}`);
  console.log(`  └─ overig: ${overig}`);
}

// --------------------
// Entry point
// --------------------
async function main() {

  try {

    const nieuweMoties = await fetchNieuweMoties();

    if (nieuweMoties.length === 0) {
      console.log("ℹ️  Geen nieuwe moties gevonden. moties.ts blijft ongewijzigd.");
      return;
    }

    const alles = [...bestaandeMoties, ...nieuweMoties];

    const tsContent = `export const moties = ${JSON.stringify(alles, null, 2)};\n`;

    fs.writeFileSync(MOTIES_TS, tsContent, "utf-8");

    toonMotieStatistieken(alles);

    console.log(`\n✅ moties.ts bijgewerkt. ${nieuweMoties.length} nieuwe moties toegevoegd.`);
    console.log(`ℹ️  Totaal moties nu: ${alles.length}`);

  } catch (err) {

    console.error("❌ Fout:", err);

  }

}

main();
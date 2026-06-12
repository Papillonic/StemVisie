const https = require("https");
const fs = require("fs");
const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");

const BASE_URL = "https://gegevensmagazijn.tweedekamer.nl/OData/v4/2.0";

/**
 * API call
 */
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

/**
 * PDF downloaden
 */
async function downloadPdf(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }

      const chunks = [];
      res.on("data", chunk => chunks.push(chunk));
      res.on("end", () => resolve(new Uint8Array(Buffer.concat(chunks))));
    }).on("error", reject);
  });
}

/**
 * PDF tekst uitlezen
 */
async function extractPdfText(data) {
  try {
    const pdf = await pdfjsLib.getDocument({ data }).promise;

    let text = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map(i => i.str).join(" ") + "\n";
    }

    return text;
  } catch (err) {
    return null;
  }
}

/**
 * 📦 ALLE moties ophalen (pagination)
 */
async function fetchAlleMoties() {
  let skip = 0;
  const pageSize = 100;
  const alleMoties = [];

  while (true) {

    const url =
      `${BASE_URL}/Zaak?$top=${pageSize}&$skip=${skip}` +
      `&$filter=Soort eq 'Motie'` +
 ` and GewijzigdOp ge 2026-01-01T00:00:00Z` +
  ` and GewijzigdOp le 2026-12-31T23:59:59Z` +
      `&$select=Id,Nummer,Onderwerp,Volgnummer` +
      `&$expand=Besluit,Kamerstukdossier`;

    const data = await fetchData(url);

    if (!data.value || data.value.length === 0) break;

    alleMoties.push(...data.value);

    console.log(`✅ ${alleMoties.length} moties geladen...`);

    skip += pageSize;
  }

  return alleMoties;
}

/**
 * 🔥 Stemmingen ophalen per besluit
 */
async function fetchStemmingen(besluitId) {
  const url =
    `${BASE_URL}/Stemming?$filter=Besluit_Id eq ${besluitId}` +
    `&$select=Soort,FractieGrootte,ActorNaam`;

  try {
    const data = await fetchData(url);
    return data.value || [];
  } catch (err) {
    return [];
  }
}

/**
 * 🔧 Verrijken van moties
 */
async function verrijkMoties(moties) {

  const resultaat = [];

  for (let i = 0; i < moties.length; i++) {

    const motie = moties[i];

    const besluiten = motie.Besluit || [];

    const besluitenMetStemming = [];

    for (const besluit of besluiten) {

      const stemmingen = await fetchStemmingen(besluit.Id);

      besluitenMetStemming.push({
        BesluitTekst: besluit.BesluitTekst,
        GewijzigdOp: besluit.GewijzigdOp,
        Stemmingen: stemmingen
      });
    }

    const kamerstukken = [];

    for (const dossier of (motie.Kamerstukdossier || [])) {

      const parts = [dossier.Nummer];
      if (dossier.Toevoeging) parts.push(dossier.Toevoeging);
      if (motie.Volgnummer) parts.push(motie.Volgnummer);

      const pdfUrl = `https://zoek.officielebekendmakingen.nl/kst-${parts.join('-')}.pdf`;

      let pdfText = null;

      try {
        const pdfData = await downloadPdf(pdfUrl);
        pdfText = await extractPdfText(pdfData);
      } catch (err) {
        // stil falen
      }

      kamerstukken.push({
        Nummer: dossier.Nummer,
        PdfUrl: pdfUrl,
        PdfText: pdfText
      });
    }

    resultaat.push({
      Id: motie.Id,
      Nummer: motie.Nummer,
      Onderwerp: motie.Onderwerp,
      Besluit: besluitenMetStemming,
      Kamerstukken: kamerstukken
    });

    if (i % 10 === 0) {
      console.log(`➡️ ${i}/${moties.length} verwerkt`);
    }
  }

  return resultaat;
}

/**
 * 📊 Analyse
 */
function analyse(moties) {

  let metBesluit = 0;
  let zonderBesluit = 0;

  moties.forEach(m => {
    if (m.Besluit && m.Besluit.length > 0) {
      metBesluit++;
    } else {
      zonderBesluit++;
    }
  });

  console.log("\n📊 Analyse");
  console.log(`Totaal: ${moties.length}`);
  console.log(`Met besluit (≈ stemming): ${metBesluit}`);
  console.log(`Zonder besluit: ${zonderBesluit}`);
}

/**
 * 🚀 Main
 */
async function main() {

  try {

    console.log("🔍 Moties ophalen...");

    const moties = await fetchAlleMoties();

    console.log(`\n📦 Totaal moties opgehaald: ${moties.length}`);

    console.log("\n🔧 Verrijken (stemmingen + PDF)...");

    const verrijkt = await verrijkMoties(moties);

    fs.writeFileSync(
      "moties.ts",
      `export const moties = ${JSON.stringify(verrijkt, null, 2)};\n`,
      "utf-8"
    );

    analyse(verrijkt);

    console.log("\n✅ Klaar: moties.ts bijgewerkt");

  } catch (err) {
    console.error("❌ Fout:", err);
  }
}

main();
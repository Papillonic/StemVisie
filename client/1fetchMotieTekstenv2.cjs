// 1fetchMotieTekstenv2.cjs
const https = require("https");
const fs = require("fs");
const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");

const BASE_URL = "https://gegevensmagazijn.tweedekamer.nl/OData/v4/2.0";

// 📅 CLI-argumenten voor begin- en einddatum
const [,, cliBegin, cliEind] = process.argv;

const today = new Date();
const lastWeek = new Date(today);
lastWeek.setDate(today.getDate() - 7);

const BEGIN_DATUM = cliBegin || process.env.BEGIN_DATUM || lastWeek.toISOString().split("T")[0];
const EIND_DATUM = cliEind || process.env.EIND_DATUM || today.toISOString().split("T")[0];

console.log(`📅 Ophalen moties van ${BEGIN_DATUM} tot ${EIND_DATUM}`);

// --------------------
// Hulp: OData fetch via https
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
// PDF downloaden en tekst uitlezen
// --------------------
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

async function extractPdfTextFromData(data) {
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    fullText += textContent.items.map(item => item.str).join(" ") + "\n";
  }
  return fullText;
}

// --------------------
// Moties ophalen
// --------------------
async function fetchAlleMoties() {
  console.log(`🔍 Ophalen moties (max 50)...`);

  const motieUrl = `${BASE_URL}/Zaak?$top=50&$filter=Soort eq 'Motie'` +
    ` and GewijzigdOp ge ${BEGIN_DATUM}T00:00:00Z` +
    ` and GewijzigdOp le ${EIND_DATUM}T23:59:59Z` +
    `&$select=Id,Nummer,Soort,Onderwerp,Volgnummer` +
    `&$expand=ZaakActor($select=ActorNaam,ActorFractie),Kamerstukdossier($select=Nummer,Toevoeging),Besluit`;

  const motieData = await fetchData(motieUrl);

  if (!motieData.value || motieData.value.length === 0) {
    console.log("Geen moties gevonden.");
    return [];
  }

  console.log(`✅ ${motieData.value.length} moties gevonden.`);

  const motiesMetStemmingen = await Promise.all(
    motieData.value.map(async (motie) => {
      const besluitenMetStemmingen = await Promise.all(
        (motie.Besluit || []).map(async (besluit) => {
          const stemmingUrl = `${BASE_URL}/Stemming?$filter=Besluit_Id eq ${besluit.Id}` +
                              `&$select=Soort,FractieGrootte,ActorNaam`;
          try {
            const stemmingData = await fetchData(stemmingUrl);
            if (stemmingData.value && stemmingData.value.length > 0) {
              return {
                BesluitTekst: besluit.BesluitTekst,
                GewijzigdOp: besluit.GewijzigdOp,
                Stemmingen: stemmingData.value
              };
            }
            return null;
          } catch (err) {
            console.warn(`⚠️ Kon stemmingen niet ophalen voor besluit ${besluit.Id}: ${err.message}`);
            return null;
          }
        })
      );

      const gefilterdeBesluiten = besluitenMetStemmingen.filter(Boolean);
      if (gefilterdeBesluiten.length === 0) return null;

      const kamerstukken = await Promise.all((motie.Kamerstukdossier || []).map(async (dossier) => {
        const parts = [dossier.Nummer];
        if (dossier.Toevoeging) parts.push(dossier.Toevoeging);
        if (motie.Volgnummer) parts.push(motie.Volgnummer);

        const pdfUrl = `https://zoek.officielebekendmakingen.nl/kst-${parts.join('-')}.pdf`;

        let pdfText = null;
        try {
          const pdfData = await downloadPdf(pdfUrl);
          pdfText = await extractPdfTextFromData(pdfData);
        } catch (err) {
          console.warn(`⚠️ Kon PDF niet uitlezen: ${pdfUrl}`);
        }

        return {
          Nummer: dossier.Nummer,
          Toevoeging: dossier.Toevoeging,
          PdfUrl: pdfUrl,
          PdfText: pdfText
        };
      }));

      return {
        Id: motie.Id,
        Nummer: motie.Nummer,
        Volgnummer: motie.Volgnummer,
        Soort: motie.Soort,
        Onderwerp: motie.Onderwerp,
        ZaakActor: motie.ZaakActor,
        Besluit: gefilterdeBesluiten,
        Kamerstukken: kamerstukken
      };
    })
  );

  return motiesMetStemmingen.filter(Boolean);
}

// --------------------
// Entry point
// --------------------
async function main() {
  try {
    const alleMoties = await fetchAlleMoties();

    const tsContent = `export const moties = ${JSON.stringify(alleMoties, null, 2)};\n`;
    fs.writeFileSync("moties.ts", tsContent, { encoding: "utf-8" });

    console.log("✅ moties.ts aangemaakt met alle opgehaalde moties.");
  } catch (err) {
    console.error("❌ Fout:", err);
  }
}

main();
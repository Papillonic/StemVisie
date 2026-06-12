const https = require("https");
const fs = require("fs");
const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");

const BASE_URL = "https://gegevensmagazijn.tweedekamer.nl/OData/v4/2.0";

const [,, cliBegin, cliEind] = process.argv;

const today = new Date();
const lastWeek = new Date(today);
lastWeek.setDate(today.getDate() - 7);

const BEGIN_DATUM = cliBegin || process.env.BEGIN_DATUM || lastWeek.toISOString().split("T")[0];
const EIND_DATUM = cliEind || process.env.EIND_DATUM || today.toISOString().split("T")[0];

console.log(`📅 Ophalen moties van ${BEGIN_DATUM} tot ${EIND_DATUM}`);

async function fetchData(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
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

async function downloadPdf(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
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

    const items = textContent.items.sort((a, b) => {
      const yA = a.transform[5], yB = b.transform[5];
      const xA = a.transform[4], xB = b.transform[4];
      if (Math.abs(yB - yA) > 2) return yB - yA;
      return xA - xB;
    });

    let lastY = null;
    let line = [];

    for (const item of items) {
      const y = item.transform[5];
      if (lastY !== null) {
        const deltaY = Math.abs(y - lastY);
        if (deltaY > 15) {
          fullText += line.join(" ") + "\n\n";
          line = [];
        } else if (deltaY > 5) {
          fullText += line.join(" ") + "\n";
          line = [];
        }
      }
      line.push(item.str.trim());
      lastY = y;
    }

    if (line.length > 0) fullText += line.join(" ") + "\n";

    fullText += "\n";
  }

  // ❗ FIX: verwijder losse paginanummers zoals "2", "12", "7"
  fullText = fullText.replace(/^\s*\d+\s*$/gm, "");

  const fullTextRaw = fullText.trim();

  // ---------- PdfText opschonen ----------
  let clean = fullText
    .replace(/[ \t]+/g, " ")
    .replace(/\n+/g, " ")
    .trim();

  const startRegex = /gehoord\s+de\s+beraadslaging[,;:]?/i;
  const startMatch = clean.match(startRegex);
  if (startMatch) clean = clean.slice(startMatch.index + startMatch[0].length);

  const endRegex = /en\s+gaat\s+over\s+tot\s+de\s+orde\s+van\s+de\s+dag/i;
  const endMatch = clean.match(endRegex);
  if (endMatch) clean = clean.slice(0, endMatch.index);

  clean = clean
    .replace(/\s{2,}/g, " ")
    .replace(/-{2,}/g, "-")
    .replace(/\s+\./g, ".")
    .trim();

  // 👉 Eerste letter hoofdletter maken
  if (clean.length > 0) {
    clean = clean[0].toUpperCase() + clean.slice(1);
  }

  // 👉 Laatste komma → punt
  clean = clean.replace(/,$/, ".");

  return { cleanText: clean, fullText: fullTextRaw };
}



async function fetchAlleMoties(beginDatum, eindDatum) {
  console.log(`🔍 Ophalen moties (max 50)...`);

  const motieUrl =
    `${BASE_URL}/Zaak?$top=50&$filter=Soort eq 'Motie'` +
    ` and GewijzigdOp ge ${beginDatum}T00:00:00Z` +
    ` and GewijzigdOp le ${eindDatum}T23:59:59Z` +
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
          const stemmingUrl =
            `${BASE_URL}/Stemming?$filter=Besluit_Id eq ${besluit.Id}` +
            `&$select=Soort,FractieGrootte,ActorNaam`;
          try {
            const stemmingData = await fetchData(stemmingUrl);
            if (stemmingData.value && stemmingData.value.length > 0) {
              return {
                BesluitTekst: besluit.BesluitTekst,
                GewijzigdOp: besluit.GewijzigdOp,
                Stemmingen: stemmingData.value,
              };
            }
            return null;
          } catch (err) {
            console.warn(
              `⚠️ Kon stemmingen niet ophalen voor besluit ${besluit.Id}: ${err.message}`
            );
            return null;
          }
        })
      );

      const gefilterdeBesluiten = besluitenMetStemmingen.filter(Boolean);
      if (gefilterdeBesluiten.length === 0) return null;

      const kamerstukken = await Promise.all(
        (motie.Kamerstukdossier || []).map(async (dossier) => {
          const parts = [dossier.Nummer];
          if (dossier.Toevoeging) parts.push(dossier.Toevoeging);
          if (motie.Volgnummer) parts.push(motie.Volgnummer);

          const pdfUrl = `https://zoek.officielebekendmakingen.nl/kst-${parts.join("-")}.pdf`;

          let pdfText = null;
          let pdfTextFull = null;

          try {
            const pdfData = await downloadPdf(pdfUrl);
            const { cleanText, fullText } = await extractPdfTextFromData(pdfData);
            pdfText = cleanText;
            pdfTextFull = fullText;
          } catch {
            console.warn(`⚠️ Kon PDF niet uitlezen: ${pdfUrl}`);
          }

          return {
            Nummer: dossier.Nummer,
            Toevoeging: dossier.Toevoeging,
            PdfUrl: pdfUrl,
            PdfText: pdfText,
            PdfTextFull: pdfTextFull,
            EenvoudigeTekst: ""
          };
        })
      );

      return {
        Id: motie.Id,
        Nummer: motie.Nummer,
        Volgnummer: motie.Volgnummer,
        Soort: motie.Soort,
        Onderwerp: motie.Onderwerp,
        ZaakActor: motie.ZaakActor,
        Besluit: gefilterdeBesluiten,
        Kamerstukken: kamerstukken,
      };
    })
  );

  return motiesMetStemmingen.filter(Boolean);
}


async function main() {
  try {
    const alleMoties = await fetchAlleMoties(BEGIN_DATUM, EIND_DATUM);

    const tsContent = `export const moties = ${JSON.stringify(alleMoties, null, 2)};\n`;
    fs.writeFileSync("moties.ts", tsContent, "utf-8");
    console.log("✅ moties.ts aangemaakt.");

    const alleTeksten = alleMoties.flatMap((motie) =>
      (motie.Kamerstukken || [])
        .map((k) => {
          if (!k.PdfText) return null;
          const titel = `=== MOTIE ${motie.Id} ===\n`;
          return `${titel}${k.PdfText.trim()}`;
        })
        .filter(Boolean)
    );

    if (alleTeksten.length === 0) {
      console.log("⚠️ Geen PDF-teksten gevonden voor motieteksten.txt");
    } else {
      const tekstOutput = alleTeksten.join("\n\n") + "\n";
      fs.writeFileSync("motieteksten.txt", tekstOutput, "utf-8");
      console.log(`✅ motieteksten.txt aangemaakt (${alleTeksten.length} moties).`);
    }
  } catch (err) {
    console.error("❌ Fout:", err);
  }
}

main();

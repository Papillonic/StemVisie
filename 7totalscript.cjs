const https = require("https");
const fs = require("fs");
const path = require("path");
const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");

const BASE_URL =
  "https://gegevensmagazijn.tweedekamer.nl/OData/v4/2.0";

/* =========================
   API HELPERS
========================= */

async function fetchData(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = "";

        res.on("data", (c) => (data += c));

        res.on("end", () => {
          if (res.statusCode < 200 || res.statusCode >= 300) {
            reject(
              new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`)
            );
            return;
          }

          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on("error", reject);
  });
}

async function downloadPdf(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          resolve(null);
          return;
        }

        const chunks = [];
        res.on("data", (c) => chunks.push(c));

        res.on("end", () => {
          resolve(new Uint8Array(Buffer.concat(chunks)));
        });
      })
      .on("error", () => resolve(null));
  });
}

async function extractPdfText(data) {
  try {
    const pdf = await pdfjsLib.getDocument({ data }).promise;

    let text = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((i) => i.str).join(" ") + "\n";
    }

    return text;
  } catch {
    return null;
  }
}

/* =========================
   CORE HELPERS
========================= */

function extractCoreText(text) {
  if (!text) return "Geen beschrijving beschikbaar.";

  const startMatch = text.match(/(constaterende[\s\S]*)/i);
  if (!startMatch) return text.trim();

  let core = startMatch[1];

  core = core.split(
    /en gaat over tot de orde van de dag/i
  )[0];

  return core.trim();
}

/* =========================
   DATA LOAD
========================= */

function loadMoties() {
  const file = path.resolve(__dirname, "./moties.ts");
  const imported = require(file);
  return imported.moties;
}

/* =========================
   API FETCH (ONLY NEW)
========================= */

async function fetchMotiesVanafNov2025() {
  let skip = 0;
  const pageSize = 100;
  const all = [];

  while (true) {
    const url =
      `${BASE_URL}/Zaak?$top=${pageSize}&$skip=${skip}` +
      `&$filter=Soort eq 'Motie'` +
      ` and GewijzigdOp ge 2025-11-12T00:00:00Z` +
      `&$select=Id,Onderwerp,GewijzigdOp,Nummer` +
      `&$expand=Besluit,Kamerstukdossier`;

    const data = await fetchData(url);

    if (!data.value?.length) break;

    all.push(...data.value);

    console.log(`📦 API geladen: ${all.length}`);

    skip += pageSize;
  }

  return all;
}

/* =========================
   STEMMINGEN
========================= */

async function fetchStemmingen(besluitId) {
  const url =
    `${BASE_URL}/Stemming?$filter=Besluit_Id eq ${besluitId}` +
    `&$select=Soort,FractieGrootte,ActorNaam`;

  try {
    const data = await fetchData(url);
    return data.value || [];
  } catch {
    return [];
  }
}

/* =========================
   MAIN SYNC
========================= */

async function main() {
  try {
    console.log("📂 moties.ts laden...");

    const bestaande = loadMoties();
    const bestaandeIds = new Set(
      bestaande.map((m) => String(m.Id))
    );

    console.log(`✅ bestaand: ${bestaande.length}`);

    console.log("\n🌐 API ophalen...");
    const api = await fetchMotiesVanafNov2025();

    const nieuw = api.filter(
      (m) => !bestaandeIds.has(String(m.Id))
    );

    console.log("\n================================");
    console.log(`📦 API totaal: ${api.length}`);
    console.log(`🆕 nieuw: ${nieuw.length}`);
    console.log("================================\n");

    if (nieuw.length === 0) {
      console.log("🎉 alles up-to-date");
      return;
    }

    const verrijkt = [];

    for (let i = 0; i < nieuw.length; i++) {
      const motie = nieuw[i];

      console.log(
        `🔧 ${i + 1}/${nieuw.length} ${motie.Nummer}`
      );

      const besluiten = motie.Besluit || [];
      const enrichedBesluiten = [];

      for (const b of besluiten) {
        const stemmingen = await fetchStemmingen(
          b.Id
        );

        enrichedBesluiten.push({
          BesluitTekst: b.BesluitTekst,
          GewijzigdOp: b.GewijzigdOp,
          Stemmingen: stemmingen,
        });
      }

      const kamerstukken = [];

      for (const d of motie.Kamerstukdossier || []) {
        const parts = [d.Nummer];
        if (d.Toevoeging) parts.push(d.Toevoeging);
        if (motie.Volgnummer) parts.push(motie.Volgnummer);

        const pdfUrl = `https://zoek.officielebekendmakingen.nl/kst-${parts.join("-")}.pdf`;

        let pdfText = null;

        try {
          const pdfData = await downloadPdf(pdfUrl);
          pdfText = await extractPdfText(pdfData);
        } catch {}

        kamerstukken.push({
          Nummer: d.Nummer,
          PdfUrl: pdfUrl,
          PdfText: pdfText,
        });
      }

      const fullText =
        kamerstukken?.[0]?.PdfText ||
        motie.Onderwerp ||
        "";

      const description = extractCoreText(fullText);

      verrijkt.push({
        Id: motie.Id,
        Nummer: motie.Nummer,
        Onderwerp: motie.Onderwerp,
        Besluit: enrichedBesluiten,
        Kamerstukken: kamerstukken,
        description,
      });
    }

    const final = [...bestaande, ...verrijkt];

    fs.writeFileSync(
      path.resolve(__dirname, "./moties.ts"),
      `export const moties = ${JSON.stringify(final, null, 2)};\n`,
      "utf-8"
    );

    console.log(
      `\n✅ klaar: ${final.length} moties totaal`
    );

  } catch (err) {
    console.error("❌ fout:", err);
  }
}

main();
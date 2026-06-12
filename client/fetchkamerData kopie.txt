const BASE_URL = "https://gegevensmagazijn.tweedekamer.nl/OData/v4/2.0";
const fetch = require("node-fetch");
const pdf = require("pdf-parse");

/**
 * Algemene fetch-helper
 */
async function fetchData(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Fetch error: ${res.status} ${res.statusText}\nURL: ${url}`);
  }
  return res.json();
}

/**
 * Haalt PDF op en zet inhoud om naar string
 */
async function fetchPdfText(pdfUrl) {
  try {
    const res = await fetch(pdfUrl);
    if (!res.ok) throw new Error(`Kon PDF niet ophalen: ${res.status}`);
    const buffer = await res.arrayBuffer();
    const data = await pdf(Buffer.from(buffer));
    return data.text;
  } catch (err) {
    console.warn(`⚠️ Fout bij PDF ${pdfUrl}: ${err.message}`);
    return null;
  }
}

/**
 * Haalt moties op en voegt PDF-tekst toe
 */
async function fetchAlleMoties() {
  console.log(`🔍 Ophalen moties (max 50)...`);

  const motieUrl = `${BASE_URL}/Zaak?$top=50&$filter=Soort eq 'Motie'` +
    ` and GewijzigdOp ge 2025-09-17T00:00:00Z` +
    ` and GewijzigdOp le 2025-09-20T23:59:59Z` +
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
      // Besluiten ophalen
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
            } else {
              return null;
            }
          } catch (err) {
            console.warn(`⚠️ Kon stemmingen niet ophalen voor besluit ${besluit.Id}: ${err.message}`);
            return null;
          }
        })
      );

      const gefilterdeBesluiten = besluitenMetStemmingen.filter(Boolean);

      // Kamersstukken + PDF-URL + PDF-tekst
      const kamerstukken = await Promise.all((motie.Kamerstukdossier || []).map(async (dossier) => {
        const parts = [dossier.Nummer];
        if (dossier.Toevoeging) parts.push(dossier.Toevoeging);
        if (motie.Volgnummer) parts.push(motie.Volgnummer);

        const pdfUrl = parts.length > 0
          ? `https://zoek.officielebekendmakingen.nl/kst-${parts.join('-')}.pdf`
          : null;

        let pdfText = null;
        if (pdfUrl) {
          pdfText = await fetchPdfText(pdfUrl);
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

  return motiesMetStemmingen;
}

/**
 * Entry point
 */
async function main() {
  try {
    const alleMoties = await fetchAlleMoties();
    console.log(JSON.stringify(alleMoties, null, 2));
  } catch (err) {
    console.error("❌ Fout:", err);
  }
}

main();

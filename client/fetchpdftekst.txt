const https = require("https");
const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");

/**
 * Download PDF en return als Uint8Array
 */
async function downloadPdf(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }

      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => {
        const buffer = Buffer.concat(chunks);
        resolve(new Uint8Array(buffer));
      });
    }).on("error", reject);
  });
}

/**
 * PDF tekst uitlezen uit een Uint8Array
 */
async function extractPdfTextFromData(data) {
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  console.log(`✅ PDF bevat ${pdf.numPages} pagina('s)`);

  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(" ");
    fullText += pageText + "\n";
  }

  return fullText;
}

/**
 * Main
 */
async function main() {
  const pdfUrl = "https://zoek.officielebekendmakingen.nl/kst-21501-20-2326.pdf";

  try {
    console.log("⬇️  PDF downloaden...");
    const pdfData = await downloadPdf(pdfUrl);

    console.log("📖 Tekst uitlezen uit PDF...");
    const text = await extractPdfTextFromData(pdfData);

    console.log("📜 Eerste 500 tekens uit PDF:");
    console.log(text.slice(0, 500));
  } catch (err) {
    console.error("❌ Fout:", err);
  }
}

main();

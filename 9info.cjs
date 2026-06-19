const fs = require("fs");
const path = require("path");

const inputPath = path.resolve(__dirname, "./src/lib/mockData.ts");
const outputPath = path.resolve(__dirname, "./src/lib/mockDataFiltered.ts");

const text = fs.readFileSync(inputPath, "utf8");

// --------------------
// 1. extract all objects
// --------------------
const objects = text.match(/{[\s\S]*?}/g) || [];

const uniqueIds = new Set();

let noSimplifiedCount = 0;
let unknownCategoryCount = 0;
let finalCount = 0;

const result = [];

for (const obj of objects) {
  const id = obj.match(/"id"\s*:\s*"([^"]+)"/)?.[1];
  const fullDescription = obj.match(/"fullDescription"\s*:\s*"([\s\S]*?)"/)?.[1];
  const simplified = obj.match(/"simplified"\s*:\s*"([\s\S]*?)"/)?.[1];
  const categorie = obj.match(/"Categorie"\s*:\s*"([\s\S]*?)"/)?.[1];

  if (!id) continue;

  // --------------------
  // track unique IDs
  // --------------------
  uniqueIds.add(id);

  const simplifiedLower = simplified?.toLowerCase() || "";
  const categorieLower = categorie?.toLowerCase() || "";

  // --------------------
  // conditions
  // --------------------
  const isNoSimplified = simplifiedLower.startsWith("geen vereenvoudigde");
  const isUnknownCategory = categorieLower === "onbekend";

  if (isNoSimplified) noSimplifiedCount++;
  if (isUnknownCategory) unknownCategoryCount++;

  if (isNoSimplified || isUnknownCategory) {
    finalCount++;

    result.push({
      id,
      fullDescription: fullDescription || "",
      simplified: simplified || "",
      Categorie: categorie || "",
    });
  }
}

// --------------------
// 2. write output file
// --------------------
const output = `
// AUTO-GENERATED FILE

module.exports = ${JSON.stringify(result, null, 2)};
`;

fs.writeFileSync(outputPath, output, "utf8");

// --------------------
// 3. logging report
// --------------------
console.log("✅ Klaar:", outputPath);
console.log("📊 ===== STATISTIEKEN =====");
console.log("🆔 Unieke ID's in bestand:", uniqueIds.size);
console.log("🚫 'geen vereenvoudigde...':", noSimplifiedCount);
console.log("❓ Categorie 'Onbekend':", unknownCategoryCount);
console.log("🎯 Totaal geselecteerd:", finalCount);
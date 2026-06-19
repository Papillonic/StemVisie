const fs = require("fs");
const path = require("path");

const basePath = path.resolve(__dirname, "./src/lib/mockData.ts");
const plusPath = path.resolve(__dirname, "./src/lib/mockDataPlus.ts");
const outputPath = path.resolve(__dirname, "./src/lib/mockDataMerged.ts");

// --------------------
// 1. read files (raw text)
// --------------------
const baseText = fs.readFileSync(basePath, "utf8");
const plusText = fs.readFileSync(plusPath, "utf8");

// --------------------
// 2. build override map from plus file (categorie)
// --------------------
const plusMap = new Map();

const plusObjects = plusText.match(/{[\s\S]*?}/g) || [];

for (const obj of plusObjects) {
  const id = obj.match(/"id"\s*:\s*"([^"]+)"/)?.[1];
  const categorie = obj.match(/"simplified"\s*:\s*"([\s\S]*?)"/)?.[1];

  if (id && categorie) {
    plusMap.set(id, categorie);
  }
}

// --------------------
// 3. replace categorie in full base file text
// --------------------
let resultText = baseText;

for (const [id, newCategorie] of plusMap.entries()) {
  const regex = new RegExp(
    `("id"\\s*:\\s*"${id}"[\\s\\S]*?"simplified"\\s*:\\s*")([\\s\\S]*?)(")`,
    "g"
  );

  resultText = resultText.replace(regex, (match, start, oldValue, end) => {
    return `${start}${newCategorie}${end}`;
  });
}

// --------------------
// 4. write output (FULL COPY preserved)
// --------------------
fs.writeFileSync(outputPath, resultText, "utf8");

console.log("✅ Klaar:", outputPath);
console.log("📦 overrides toegepast:", plusMap.size);
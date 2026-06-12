const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "src/lib/mockData.ts");
const file = fs.readFileSync(filePath, "utf-8");

const blocks = file.split(/(?=\{\s*"id")/g);

function cleanText(str) {
  return str
    .replace(/\s+/g, " ")                 // whitespace normaliseren
    .replace(/gehoord de beraadslaging,?/gi, "") // weg
    .replace(/,\s*en\s*$/i, "")           // eind ", en"
    .replace(/,\s*en\s+/gi, " ")          // middenin ", en"
    .trim();
}

let updatedBlocks = [];

for (let block of blocks) {
  const id = block.match(/"id"\s*:\s*"([^"]+)"/)?.[1];

  const descriptionMatch = block.match(/"description"\s*:\s*"([\s\S]*?)"/);
  const fullMatch = block.match(/"fullDescription"\s*:\s*"([\s\S]*?)"/);

  if (!id || !descriptionMatch || !fullMatch) {
    updatedBlocks.push(block);
    continue;
  }

  const description = descriptionMatch[1];
  const fullDescription = fullMatch[1];

  let newDescription = description;

  // als geen "constaterende", dan fallback extract
  const hasConstaterende = fullDescription
    .toLowerCase()
    .includes("constaterende");

  if (!hasConstaterende) {
    const start = fullDescription
      .toLowerCase()
      .indexOf("gehoord de beraadslaging");

    const end = fullDescription
      .toLowerCase()
      .indexOf("gaat over tot de orde van de dag");

    if (start !== -1 && end !== -1) {
      newDescription = fullDescription.slice(start, end);
    }
  }

  // 🔥 CLEANUP STAP (wat jij net vroeg)
  newDescription = cleanText(newDescription);

  const updatedBlock = block.replace(
    /"description"\s*:\s*"([\s\S]*?)"/,
    `"description": "${newDescription.replace(/"/g, '\\"')}"`
  );

  updatedBlocks.push(updatedBlock);
}

fs.writeFileSync(filePath, updatedBlocks.join(""), "utf-8");

console.log("\n✔️ Klaar");
console.log("description velden opgeschoond + bijgewerkt");
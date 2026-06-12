const fs = require("fs");
const path = require("path");

const tweedeSetPath = path.join(__dirname, "TweedeSet.txt");
const mockDataPath = path.join(__dirname, "src", "lib", "mockData.ts");

// =========================
// TweedeSet.txt uitlezen
// =========================

function extractTweedeSet(content) {
  const result = new Map();

  const regex =
    /ID:\s*([0-9a-f-]{36})\s*Tekst:\s*([\s\S]*?)(?=\n\s*ID:|$)/gi;

  let match;

  while ((match = regex.exec(content)) !== null) {
    const id = match[1];

    // regels samenvoegen tot 1 zin
    const text = match[2]
      .replace(/\r/g, "")
      .split("\n")
      .map(line => line.trim())
      .filter(Boolean)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    result.set(id, text);
  }

  return result;
}

// =========================
// mockData.ts aanpassen
// =========================

function updateMockData(content, updates) {
  let updatedCount = 0;

  const updatedContent = content.replace(
    /("id"\s*:\s*"([0-9a-f-]{36})"[\s\S]*?"simplified"\s*:\s*")([\s\S]*?)(")/g,
    (fullMatch, before, id, currentSimplified, after) => {
      if (!updates.has(id)) {
        return fullMatch;
      }

      const newText = updates
        .get(id)
        .replace(/\\/g, "\\\\")
        .replace(/"/g, '\\"');

      updatedCount++;

      return `${before}${newText}${after}`;
    }
  );

  return {
    updatedContent,
    updatedCount,
  };
}

// =========================
// bestanden lezen
// =========================

const tweedeSetContent = fs.readFileSync(
  tweedeSetPath,
  "utf8"
);

const mockDataContent = fs.readFileSync(
  mockDataPath,
  "utf8"
);

// =========================
// data verwerken
// =========================

const updates = extractTweedeSet(tweedeSetContent);

const {
  updatedContent,
  updatedCount,
} = updateMockData(mockDataContent, updates);

// =========================
// mockData.ts overschrijven
// =========================

fs.writeFileSync(
  mockDataPath,
  updatedContent,
  "utf8"
);

console.log("=== Klaar ===");
console.log(`Aantal bijgewerkte moties: ${updatedCount}`);
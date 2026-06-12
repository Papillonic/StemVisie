// controleDescriptions.cjs

const fs = require("fs");
const path = require("path");

const mockDataPath = path.resolve(
  __dirname,
  "./src/lib/mockData.ts"
);

if (!fs.existsSync(mockDataPath)) {
  console.error("❌ mockData.ts niet gevonden");
  process.exit(1);
}

const content = fs.readFileSync(mockDataPath, "utf-8");

// mockAmendments array pakken
const match = content.match(
  /export const mockAmendments: Amendment\[\] = (\[[\s\S]*?\]);/
);

if (!match) {
  console.error("❌ mockAmendments niet gevonden");
  process.exit(1);
}

let amendments;

try {
  amendments = JSON.parse(match[1]);
} catch (err) {
  console.error("❌ JSON parse fout:", err);
  process.exit(1);
}

// controleren
const matches = amendments.filter((m) => {
  if (!m.title || !m.description) return false;

  return (
    m.title.trim() === m.description.trim()
  );
});

console.log(
  `\n⚠️ ${matches.length} moties hebben description == title\n`
);

// eerste 25 tonen
matches.slice(0, 25).forEach((m, index) => {
  console.log(`${index + 1}. ${m.id}`);
  console.log(`Titel: ${m.title}\n`);
});

console.log("🏁 Klaar\n");
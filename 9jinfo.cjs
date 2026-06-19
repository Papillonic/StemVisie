// getCategories.cjs
const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "src/lib/mockData.ts");

// lees bestand als tekst
const raw = fs.readFileSync(filePath, "utf8");

// pak de export array eruit
const match = raw.match(/export const mockAmendments:\s*Amendment\[\]\s*=\s*(\[[\s\S]*\]);/);

if (!match) {
  console.error("Kon mockAmendments array niet vinden.");
  process.exit(1);
}

// veilige evaluatie van de array literal
const data = eval(match[1]);

const categories = new Set();

data.forEach((item) => {
  if (item?.Categorie) {
    categories.add(item.Categorie);
  }
});

const sorted = Array.from(categories).sort();

console.log("Unieke categorieën:\n");
sorted.forEach((c) => console.log("-", c));

console.log(`\nTotaal: ${sorted.length}`);
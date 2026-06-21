const fs = require("fs");
const path = require("path");

const source = path.join(__dirname, "src/lib/mockData.ts");

const content = fs.readFileSync(source, "utf8");

const marker = "export const mockParties: Party[] = [";

const idx = content.indexOf(marker);

if (idx === -1) {
  throw new Error("mockParties marker niet gevonden");
}

const amendmentsPart = content.slice(0, idx).trim();
const partiesPart = content.slice(idx).trim();

const amendmentsFile = amendmentsPart;

const partiesFile =
  'import type { Party } from "@shared/schema";\n\n' +
  partiesPart;

const indexFile = `
export { mockAmendments } from "./mockAmendments";
export { mockParties } from "./mockParties";
`.trim();

fs.writeFileSync(
  path.join(__dirname, "src/lib/mockAmendments.ts"),
  amendmentsFile
);

fs.writeFileSync(
  path.join(__dirname, "src/lib/mockParties.ts"),
  partiesFile
);

fs.writeFileSync(
  path.join(__dirname, "src/lib/mockData.ts"),
  indexFile
);

console.log("✅ Gesplitst");
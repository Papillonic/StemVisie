const fs = require("fs");
const path = require("path");

// --------------------
const filePath = path.join(__dirname, "src/lib/mockData.ts");
const outputPath = path.join(__dirname, "category-review.json");

const raw = fs.readFileSync(filePath, "utf8");

// --------------------
function extractArray(raw) {
  const eqIndex = raw.indexOf("=");

  const after = eqIndex !== -1 ? raw.slice(eqIndex + 1) : raw;

  const start = after.indexOf("[");

  let depth = 0;
  let end = -1;

  for (let i = start; i < after.length; i++) {
    const char = after[i];

    if (char === "[") depth++;
    if (char === "]") depth--;

    if (depth === 0) {
      end = i;
      break;
    }
  }

  const clean = after.slice(start, end + 1);

  return eval("(" + clean + ")");
}

const amendments = extractArray(raw);

// --------------------
const categoryKeywords = {
  "Onderwijs & Cultuur": [
    "onderwijs",
    "school",
    "student",
    "universiteit",
    "cultuur",
    "kunst",
    "museum",
    "leraar"
  ],

  "Digitale Zaken & Technologie": [
    "ai",
    "kunstmatige intelligentie",
    "algoritme",
    "cyber",
    "ict",
    "internet",
    "digitaal",
    "data"
  ],

  "Zorg & Welzijn": [
    "zorg",
    "ziekenhuis",
    "huisarts",
    "ggz",
    "patiënt",
    "jeugdzorg",
    "ouderenzorg"
  ],

  "Buitenlandse Zaken & Defensie": [
    "defensie",
    "militair",
    "leger",
    "navo",
    "oekraïne",
    "kazerne",
    "wapens"
  ],

  "Klimaat & Milieu": [
    "klimaat",
    "co2",
    "stikstof",
    "milieu",
    "natuur",
    "duurzaam",
    "uitstoot"
  ],

  "Migratie & Integratie": [
    "asiel",
    "asielzoeker",
    "migratie",
    "vluchteling",
    "statushouder",
    "integratie"
  ],

  "Mobiliteit & Infrastructuur": [
    "weg",
    "spoor",
    "trein",
    "verkeer",
    "rijbewijs",
    "infrastructuur",
    "ov"
  ],

  "Economie & Wonen": [
    "woning",
    "huur",
    "koopwoning",
    "belasting",
    "bedrijf",
    "ondernemer",
    "arbeidsmarkt",
    "economie"
  ],

  "Veiligheid & Justitie": [
    "politie",
    "justitie",
    "straf",
    "criminaliteit",
    "gevangenis",
    "rechtspraak"
  ]
};

// --------------------
function predictCategory(text) {
  text = (text || "").toLowerCase();

  let bestCategory = null;
  let bestScore = 0;

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    let score = 0;

    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        score++;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }

  return {
    category: bestCategory,
    score: bestScore
  };
}

// --------------------
const reviewList = [];

for (const amendment of amendments) {
  const prediction = predictCategory(
    amendment.fullDescription || ""
  );

  // Alleen meenemen als er een redelijke match is
  if (prediction.score < 2) {
    continue;
  }

  if (prediction.category !== amendment.Categorie) {
    reviewList.push({
      id: amendment.id,
      huidigeCategorie: amendment.Categorie,
      voorgesteldeCategorie: prediction.category,
      description: amendment.description
    });
  }
}

// --------------------
fs.writeFileSync(
  outputPath,
  JSON.stringify(reviewList, null, 2),
  "utf8"
);

// --------------------
console.log(`✅ ${reviewList.length} verdachte moties gevonden`);
console.log(`📄 Bestand opgeslagen: ${outputPath}`);
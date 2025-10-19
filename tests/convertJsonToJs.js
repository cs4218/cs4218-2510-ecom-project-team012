// Used to preprocess Mongo export JSON files given in canvas into JS modules for seeding data for testing purposes

import fs from "fs";
import path from "path";

const inputDir = "./tests/sample_db_schema";
const outputDir = "./tests/seed_data";

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

function escapeString(str) {
  return str
    .replace(/\\/g, "\\\\") // escape backslashes
    .replace(/"/g, '\\"') // escape quotes
    .replace(/\r?\n/g, "\\n"); // escape newlines
}

function convertValue(value) {
  if (Array.isArray(value)) {
    return `[${value.map(convertValue).join(", ")}]`;
  }

  if (value && typeof value === "object") {
    if (value.$oid) {
      return `new mongoose.Types.ObjectId("${value.$oid}")`;
    }
    if (value.$date) {
      return `new Date("${value.$date}")`;
    }
    if (value.$binary?.base64) {
      return `Buffer.from("${value.$binary.base64}", "base64")`;
    }
    // nested object
    return `{ ${Object.entries(value)
      .map(([k, v]) => `${k}: ${convertValue(v)}`)
      .join(", ")} }`;
  }

  // primitives
  if (typeof value === "string") {
    return `"${escapeString(value)}"`;
  }

  return String(value);
}

function buildExport(varName, data) {
  const arrayString = data
    .map(
      (doc) =>
        `{\n  ${Object.entries(doc)
          .map(([k, v]) => `${k}: ${convertValue(v)}`)
          .join(",\n  ")}\n}`
    )
    .join(",\n\n");

  return `import mongoose from "mongoose";\n\nexport const ${varName} = [\n${arrayString}\n];\n`;
}

for (const file of fs.readdirSync(inputDir)) {
  if (!file.endsWith(".json")) continue;

  const raw = fs.readFileSync(path.join(inputDir, file), "utf8");
  const data = JSON.parse(raw);

  const baseName = path.basename(file, ".json").replace(/^test\./, "");
  const varName = baseName.toUpperCase();

  const outputPath = path.join(outputDir, `${baseName}.js`);
  const jsCode = buildExport(varName, data);

  fs.writeFileSync(outputPath, jsCode);
  console.log(`✅ Converted ${file} → ${outputPath}`);
}

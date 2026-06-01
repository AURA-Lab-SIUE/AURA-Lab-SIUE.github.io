import Ajv from "ajv/dist/2020.js";
import fs from "node:fs";
const schema = JSON.parse(fs.readFileSync("src/data/theories.schema.json", "utf8"));
const data = JSON.parse(fs.readFileSync("src/data/theories.json", "utf8"));
const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(schema);
let ok = validate(data);
const errors = ok ? [] : validate.errors.map(e => `${e.instancePath} ${e.message}`);
const slugs = new Set();
for (const t of data) {
  if (slugs.has(t.slug)) errors.push(`duplicate slug: ${t.slug}`);
  slugs.add(t.slug);
}
const EM_DASH = "\u2014";
const proseFields = ["summary", "what_it_is", "core_idea", "how_used", "example"];
for (const t of data) for (const f of proseFields)
  if (typeof t[f] === "string" && t[f].includes(EM_DASH)) errors.push(`em-dash in ${t.slug}.${f}`);
if (errors.length) { console.error("INVALID:\n" + errors.join("\n")); process.exit(1); }
console.log(`OK: ${data.length} theories valid`);

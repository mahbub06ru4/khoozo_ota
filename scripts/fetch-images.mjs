// Downloads topic-matched, freely licensed photos from Wikimedia Commons into public/images
// and writes public/images/CREDITS.json. Usage: node scripts/fetch-images.mjs [--force]
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const OUT = join(process.cwd(), "public", "images");
const FORCE = process.argv.includes("--force");
const UA = "khoozo-ota-dev/1.0 (prototype; image fetch script)";

const IMAGES = {
  "hero/flights": "Airplane wing above clouds",
  "hero/visa": "Airport departure hall travellers",
  "hero/study": "University library reading room",
  "hero/holidays": "Maldives island beach",
  "destinations/coxs-bazar": "Cox's Bazar sea beach",
  "destinations/dubai": "Dubai skyline Burj Khalifa",
  "destinations/bangkok": "Wat Arun Bangkok",
  "destinations/kuala-lumpur": "Petronas Twin Towers night",
  "destinations/maldives": "Maldives water villas",
  "destinations/kathmandu": "Phewa Lake Pokhara Annapurna",
  "destinations/singapore": "Marina Bay Sands skyline",
  "destinations/istanbul": "Cappadocia hot air balloons",
  "destinations/sajek": "Sajek Valley Rangamati",
  "destinations/saint-martin": "Saint Martin's Island Bangladesh",
  "hotels/hotel-1": "hotel room bed interior",
  "hotels/hotel-2": "hotel swimming pool resort",
  "hotels/hotel-3": "hotel lobby interior",
  "hotels/hotel-4": "luxury hotel suite",
  "hotels/hotel-5": "beach resort hotel",
  "hotels/hotel-6": "hotel twin room",
  "study/gb": "University of Oxford Radcliffe Camera",
  "study/us": "Harvard University Widener Library",
  "study/ca": "University of Toronto University College",
  "study/au": "University of Sydney Quadrangle",
  "study/de": "Heidelberg University Old University",
  "study/my": "Universiti Malaya",
  "promos/airline": "Emirates Airbus A380",
  "promos/card": "credit cards",
  "promos/mobile": "smartphone in hand",
};

async function search(term) {
  const url = new URL("https://commons.wikimedia.org/w/api.php");
  Object.entries({
    action: "query",
    generator: "search",
    gsrsearch: `${term} filetype:bitmap`,
    gsrnamespace: "6",
    gsrlimit: "12",
    prop: "imageinfo",
    iiprop: "url|mime|size|extmetadata",
    iiextmetadatafilter: "LicenseShortName|Artist",
    iiurlwidth: "1280",
    format: "json",
  }).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`search ${res.status}`);
  const pages = Object.values((await res.json()).query?.pages ?? {}).sort((a, b) => a.index - b.index);
  return pages
    .map((p) => ({ title: p.title, info: p.imageinfo?.[0] }))
    .find(({ info }) => info && info.mime === "image/jpeg" && info.width >= 1000 && info.width > info.height * 1.15);
}

const strip = (html = "") => html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
const credits = {};

for (const [key, term] of Object.entries(IMAGES)) {
  const file = join(OUT, `${key}.jpg`);
  if (existsSync(file) && !FORCE) {
    console.log("skip", key);
    continue;
  }
  try {
    const hit = await search(term);
    if (!hit) {
      console.warn("no match", key, term);
      continue;
    }
    const img = await fetch(hit.info.thumburl, { headers: { "User-Agent": UA } });
    if (!img.ok) throw new Error(`download ${img.status}`);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, Buffer.from(await img.arrayBuffer()));
    credits[key] = {
      title: hit.title.replace(/^File:/, ""),
      author: strip(hit.info.extmetadata?.Artist?.value),
      license: hit.info.extmetadata?.LicenseShortName?.value ?? "",
      source: hit.info.descriptionurl,
    };
    console.log("ok", key, "←", hit.title);
    await new Promise((r) => setTimeout(r, 2500));
  } catch (e) {
    console.warn("fail", key, e.message);
  }
}

const creditsFile = join(OUT, "CREDITS.json");
let existing = {};
try {
  existing = JSON.parse((await import("node:fs")).readFileSync(creditsFile, "utf8"));
} catch {}
writeFileSync(creditsFile, JSON.stringify({ ...existing, ...credits }, null, 2));
console.log("credits written");

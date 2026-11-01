// Renders marketing/*.html ad creatives to PNG. Usage: node scripts/render-ads.mjs
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright-core";

const EXECUTABLE = process.env.BROWSER_PATH ?? "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const DIR = join(process.cwd(), "marketing");
const ADS = [
  { html: "ad-square.html", out: "ad-square-1080.png", width: 1080, height: 1080 },
  { html: "ad-story.html", out: "ad-story-1080x1920.png", width: 1080, height: 1920 },
];

const browser = await chromium.launch({ executablePath: EXECUTABLE, headless: true });
for (const ad of ADS) {
  const page = await browser.newPage({ viewport: { width: ad.width, height: ad.height } });
  await page.goto(pathToFileURL(join(DIR, ad.html)).href, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: join(DIR, ad.out), clip: { x: 0, y: 0, width: ad.width, height: ad.height } });
  console.log("saved", ad.out);
  await page.close();
}
await browser.close();

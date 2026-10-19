// Captures full-page screenshots of the key flows. Usage: node scripts/screenshots.mjs [baseUrl]
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { chromium } from "playwright-core";

const BASE = process.argv[2] ?? "http://localhost:3000";
const OUT = join(process.cwd(), "screenshots");
const EXECUTABLE = process.env.BROWSER_PATH ?? "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";

const iso = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};
const q = (obj) => encodeURIComponent(JSON.stringify(obj));

const flightQuery = {
  kind: "flight",
  tripType: "oneway",
  legs: [{ origin: "DAC", destination: "CXB", date: iso(10) }],
  passengers: { adults: 1, children: 0, infants: 0 },
  cabin: "Economy",
};
const intlQuery = { ...flightQuery, tripType: "roundtrip", legs: [{ origin: "DAC", destination: "DXB", date: iso(20) }], returnDate: iso(27), passengers: { adults: 2, children: 1, infants: 0 } };
const hotelQuery = { kind: "hotel", destination: "Cox's Bazar", checkIn: iso(14), checkOut: iso(16), rooms: [{ adults: 2, children: 0 }] };

const browser = await chromium.launch({ executablePath: EXECUTABLE, headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const page = await context.newPage();
let count = 0;

async function loadLazyImages() {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 80));
    }
    window.scrollTo(0, 0);
    await Promise.all([...document.images].filter((i) => !i.complete).map((i) => new Promise((r) => (i.onload = i.onerror = r))));
  });
}

async function shot(folder, name) {
  await loadLazyImages();
  await page.waitForTimeout(700);
  const file = join(OUT, folder, `${String(++count).padStart(2, "0")}-${name}.png`);
  mkdirSync(dirname(file), { recursive: true });
  await page.screenshot({ path: file, fullPage: true });
  console.log("saved", file);
}

async function go(path) {
  await page.goto(BASE + path, { waitUntil: "networkidle" });
}

// Home
await go("/");
await shot("01-home", "home-flight-search");
await go("/?tab=hotels");
await shot("01-home", "home-hotel-search");
await go("/?tab=holidays");
await shot("01-home", "home-holiday-search");
await go("/?tab=visa");
await shot("01-home", "home-visa-search");

// Flights: results → details → checkout → payment → e-ticket
await go(`/search/flights?q=${q(intlQuery)}`);
await page.getByText(/^Showing/).waitFor();
await shot("02-flight-tickets", "international-flight-results");
await page.getByRole("button", { name: /Flight details/ }).first().click();
await shot("02-flight-tickets", "flight-details-fare-summary");

await go(`/search/flights?q=${q(flightQuery)}`);
await page.getByText(/^Showing/).waitFor();
await page.getByRole("button", { name: "Book now" }).first().click();
await page.waitForURL("**/checkout");
await page.getByLabel("First / given name").fill("Rahim");
await page.getByLabel("Last / surname").fill("Uddin");
await page.getByLabel("Date of birth").fill("1994-05-10");
await page.getByLabel("Email").fill("rahim@example.com");
await page.getByLabel("Mobile number").fill("01712345678");
await shot("02-flight-tickets", "checkout-traveller-details");
await page.getByRole("button", { name: "Continue to payment" }).click();
await page.getByLabel("Card number").fill("4242424242424242");
await page.getByLabel("Name on card").fill("RAHIM UDDIN");
await page.getByLabel("Expiry (MM/YY)").fill("12/30");
await page.getByLabel("CVV").fill("123");
await page.getByRole("checkbox").check();
await shot("02-flight-tickets", "payment-gateway-card");
await page.getByRole("button", { name: /^Pay / }).click();
await page.getByText("Booking confirmed!").waitFor({ timeout: 10000 });
await shot("02-flight-tickets", "e-ticket-booking-confirmed");

// Hotels
await go(`/search/hotels?q=${q(hotelQuery)}`);
await page.getByText(/^Showing/).waitFor();
await shot("03-hotels", "hotel-results-coxs-bazar");
await page.getByRole("button", { name: "Select room" }).first().click();
await page.waitForURL("**/checkout");
await shot("03-hotels", "hotel-checkout");

// Holidays
await go("/holidays");
await shot("04-holiday-packages", "holiday-packages");
await go("/holidays/dubai-city-lights");
await shot("04-holiday-packages", "package-dubai-itinerary-customise");
await go("/holidays/custom?dest=MLE");
await page.getByRole("button", { name: /Signature experience/ }).first().waitFor().catch(() => {});
await shot("04-holiday-packages", "build-your-own-holiday");
await page.getByRole("button", { name: "Continue" }).click();
await page.getByLabel("Full name").fill("Rahim Uddin");
await page.getByLabel("Email").fill("rahim@example.com");
await page.getByRole("textbox", { name: "Mobile" }).fill("01712345678");
await page.getByRole("button", { name: "Confirm request" }).click();
await page.getByText("Holiday request confirmed").waitFor({ timeout: 10000 });
await shot("04-holiday-packages", "holiday-booking-confirmed");

// Visa & study abroad
await go("/visa");
await shot("05-visa-study-abroad", "visa-services-and-study-abroad");
await go("/visa/ae?type=tourist");
await page.getByText("Document checklist").waitFor();
await shot("05-visa-study-abroad", "uae-tourist-visa");
await go("/visa/gb?type=student");
await page.getByText(/key requirements/).waitFor();
await shot("05-visa-study-abroad", "uk-student-visa-requirements");
await go("/visa/ca?type=student");
await page.getByRole("button", { name: "Apply now" }).click();
await page.getByLabel("Given name").fill("Nusrat");
await page.getByLabel("Surname").fill("Jahan");
await page.getByLabel("University / institution").fill("University of Toronto");
await page.getByLabel("Course / program").fill("MSc Computer Science");
await shot("05-visa-study-abroad", "canada-study-permit-application");

// Account
await go("/bookings");
await shot("06-account", "my-bookings");

await browser.close();
console.log(`done: ${count} screenshots`);

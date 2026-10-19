import { ADD_ONS, findDestination, findPackage, MEAL_PER_PERSON_NIGHT, type HolidayConfig, type HolidayQuote } from "@/lib/data/holidays";

const CHILD_FACTOR = 0.7;
const TAX_RATE = 0.05;
const PACKAGE_DISCOUNT = 0.08;

export function quoteHoliday(c: HolidayConfig): HolidayQuote | null {
  const dest = findDestination(c.destination);
  if (!dest) return null;
  const pkg = c.packageSlug ? findPackage(c.packageSlug) : undefined;
  const paxUnits = c.adults + c.children * CHILD_FACTOR;
  const people = c.adults + c.children;

  const flights = c.includeFlights && dest.flightPP > 0 ? Math.round(dest.flightPP * paxUnits) : 0;
  const hotel = dest.hotelNight[c.tier] * c.nights * c.rooms;
  const meals = Math.round(MEAL_PER_PERSON_NIGHT[c.meal] * paxUnits * c.nights);

  const addOns = ADD_ONS.filter((a) => c.addOns.includes(a.key)).map((a) => ({
    key: a.key,
    label: a.label,
    amount: a.unit === "person" ? a.price * people : a.unit === "night" ? a.price * c.nights : a.price,
  }));
  if (!dest.visaRequired) {
    const i = addOns.findIndex((a) => a.key === "visa");
    if (i >= 0) addOns.splice(i, 1);
  }

  const subtotal = flights + hotel + meals + addOns.reduce((n, a) => n + a.amount, 0);
  const packageDiscount = pkg && pkg.destination === c.destination ? Math.round(subtotal * PACKAGE_DISCOUNT) : 0;
  const taxes = Math.round((subtotal - packageDiscount) * TAX_RATE);
  const total = subtotal - packageDiscount + taxes;

  return { flights, hotel, meals, addOns, subtotal, packageDiscount, taxes, total, perPerson: Math.round(total / Math.max(1, people)) };
}

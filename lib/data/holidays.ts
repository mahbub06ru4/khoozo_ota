export type HotelTier = 3 | 4 | 5;
export type MealPlan = "room" | "breakfast" | "halfboard" | "fullboard";

export interface HolidayDestination {
  code: string;
  name: string;
  country: string;
  flag: string;
  airport: string;
  flightPP: number;
  hotelNight: Record<HotelTier, number>;
  visaRequired: boolean;
  gradient: string;
  image: string;
}

export interface HolidayPackage {
  slug: string;
  name: string;
  destination: string;
  defaultNights: number;
  minNights: number;
  maxNights: number;
  tier: HotelTier;
  meal: MealPlan;
  tags: string[];
  highlights: string[];
  itinerary: { title: string; text: string }[];
  includedAddOns: string[];
}

export interface AddOn {
  key: string;
  label: string;
  unit: "person" | "trip" | "night";
  price: number;
  description: string;
}

export const DESTINATIONS: HolidayDestination[] = [
  { code: "MLE", name: "Maldives", country: "Maldives", flag: "🇲🇻", airport: "MLE", flightPP: 42000, hotelNight: { 3: 9000, 4: 18000, 5: 38000 }, visaRequired: false, gradient: "from-cyan-300 to-sky-600", image: "/images/destinations/maldives.jpg" },
  { code: "BKK", name: "Bangkok & Pattaya", country: "Thailand", flag: "🇹🇭", airport: "BKK", flightPP: 26000, hotelNight: { 3: 3500, 4: 6500, 5: 12000 }, visaRequired: true, gradient: "from-fuchsia-400 to-purple-600", image: "/images/destinations/bangkok.jpg" },
  { code: "DXB", name: "Dubai", country: "UAE", flag: "🇦🇪", airport: "DXB", flightPP: 39000, hotelNight: { 3: 6000, 4: 10500, 5: 21000 }, visaRequired: true, gradient: "from-amber-300 to-orange-600", image: "/images/destinations/dubai.jpg" },
  { code: "KUL", name: "Kuala Lumpur & Langkawi", country: "Malaysia", flag: "🇲🇾", airport: "KUL", flightPP: 28000, hotelNight: { 3: 3800, 4: 6800, 5: 13000 }, visaRequired: true, gradient: "from-teal-400 to-emerald-700", image: "/images/destinations/kuala-lumpur.jpg" },
  { code: "KTM", name: "Kathmandu & Pokhara", country: "Nepal", flag: "🇳🇵", airport: "KTM", flightPP: 20000, hotelNight: { 3: 2800, 4: 5200, 5: 9800 }, visaRequired: false, gradient: "from-rose-400 to-red-600", image: "/images/destinations/kathmandu.jpg" },
  { code: "SIN", name: "Singapore", country: "Singapore", flag: "🇸🇬", airport: "SIN", flightPP: 34000, hotelNight: { 3: 9000, 4: 15000, 5: 26000 }, visaRequired: true, gradient: "from-red-400 to-rose-700", image: "/images/destinations/singapore.jpg" },
  { code: "IST", name: "Istanbul & Cappadocia", country: "Türkiye", flag: "🇹🇷", airport: "IST", flightPP: 62000, hotelNight: { 3: 5000, 4: 8500, 5: 16000 }, visaRequired: true, gradient: "from-indigo-400 to-blue-800", image: "/images/destinations/istanbul.jpg" },
  { code: "CXB", name: "Cox's Bazar & Saint Martin", country: "Bangladesh", flag: "🇧🇩", airport: "CXB", flightPP: 5500, hotelNight: { 3: 3000, 4: 6000, 5: 11000 }, visaRequired: false, gradient: "from-sky-400 to-blue-700", image: "/images/destinations/saint-martin.jpg" },
  { code: "SJK", name: "Sajek & Rangamati", country: "Bangladesh", flag: "🇧🇩", airport: "", flightPP: 0, hotelNight: { 3: 2500, 4: 4500, 5: 7000 }, visaRequired: false, gradient: "from-emerald-400 to-teal-700", image: "/images/destinations/sajek.jpg" },
];

export const MEAL_LABEL: Record<MealPlan, string> = {
  room: "Room only",
  breakfast: "Breakfast",
  halfboard: "Half board",
  fullboard: "Full board",
};
export const MEAL_PER_PERSON_NIGHT: Record<MealPlan, number> = { room: 0, breakfast: 900, halfboard: 2200, fullboard: 3600 };

export const ADD_ONS: AddOn[] = [
  { key: "transfer", label: "Private airport transfers", unit: "trip", price: 6500, description: "Return transfers in a private car." },
  { key: "citytour", label: "Guided city tour", unit: "person", price: 4500, description: "Full-day tour with English-speaking guide." },
  { key: "adventure", label: "Signature experience", unit: "person", price: 9500, description: "Desert safari / island hopping / paragliding (by destination)." },
  { key: "insurance", label: "Travel insurance", unit: "person", price: 1800, description: "Medical, baggage and trip-cancellation cover." },
  { key: "visa", label: "Visa assistance", unit: "person", price: 3500, description: "Document review and submission (fee extra)." },
  { key: "sim", label: "Local SIM / eSIM", unit: "person", price: 1500, description: "Data pack for the whole stay." },
  { key: "guide", label: "Private guide (per day)", unit: "night", price: 5500, description: "Dedicated guide for every day of the trip." },
];

export const PACKAGES: HolidayPackage[] = [
  {
    slug: "maldives-island-escape",
    name: "Maldives Island Escape",
    destination: "MLE",
    defaultNights: 3,
    minNights: 2,
    maxNights: 7,
    tier: 4,
    meal: "halfboard",
    tags: ["Honeymoon", "Beach"],
    highlights: ["Overwater or beach villa", "Speedboat transfers", "Snorkelling trip"],
    itinerary: [
      { title: "Arrive Malé", text: "Speedboat to resort, sunset at leisure." },
      { title: "Island day", text: "Snorkelling excursion and spa time." },
      { title: "Sandbank picnic", text: "Optional sandbank lunch or dolphin cruise." },
      { title: "Depart", text: "Breakfast, transfer to Velana airport." },
    ],
    includedAddOns: ["transfer", "insurance"],
  },
  {
    slug: "bangkok-pattaya",
    name: "Bangkok & Pattaya",
    destination: "BKK",
    defaultNights: 5,
    minNights: 3,
    maxNights: 10,
    tier: 4,
    meal: "breakfast",
    tags: ["Family", "City"],
    highlights: ["Coral Island tour", "Bangkok temples", "Safari World"],
    itinerary: [
      { title: "Arrive Bangkok", text: "Transfer to Pattaya, evening Walking Street." },
      { title: "Coral Island", text: "Speedboat to Koh Larn, water sports optional." },
      { title: "Pattaya → Bangkok", text: "Nong Nooch garden en route." },
      { title: "Bangkok city", text: "Grand Palace, Wat Pho and river cruise." },
      { title: "Safari World", text: "Marine park and safari park." },
      { title: "Depart", text: "Shopping at MBK then airport." },
    ],
    includedAddOns: ["transfer", "citytour"],
  },
  {
    slug: "dubai-city-lights",
    name: "Dubai City Lights",
    destination: "DXB",
    defaultNights: 4,
    minNights: 3,
    maxNights: 8,
    tier: 4,
    meal: "breakfast",
    tags: ["Shopping", "Adventure"],
    highlights: ["Desert safari with BBQ", "Burj Khalifa 124th floor", "Dhow cruise dinner"],
    itinerary: [
      { title: "Arrive Dubai", text: "Transfer, evening dhow cruise dinner." },
      { title: "City tour", text: "Old Dubai, souks, Burj Khalifa." },
      { title: "Desert safari", text: "Dune bashing, camel ride, BBQ dinner." },
      { title: "Free day", text: "Dubai Mall / Abu Dhabi day trip optional." },
      { title: "Depart", text: "Transfer to DXB." },
    ],
    includedAddOns: ["transfer", "adventure", "visa"],
  },
  {
    slug: "kathmandu-pokhara",
    name: "Kathmandu & Pokhara",
    destination: "KTM",
    defaultNights: 4,
    minNights: 3,
    maxNights: 9,
    tier: 3,
    meal: "breakfast",
    tags: ["Mountains", "Budget"],
    highlights: ["Sarangkot sunrise", "Phewa Lake boating", "Durbar Square"],
    itinerary: [
      { title: "Arrive Kathmandu", text: "Thamel evening walk." },
      { title: "Drive to Pokhara", text: "Scenic Prithvi Highway drive." },
      { title: "Sarangkot sunrise", text: "Annapurna views, lake boating." },
      { title: "Back to Kathmandu", text: "Swayambhunath & Durbar Square." },
      { title: "Depart", text: "Transfer to TIA." },
    ],
    includedAddOns: ["transfer", "citytour"],
  },
  {
    slug: "coxs-bazar-saint-martin",
    name: "Cox's Bazar & Saint Martin",
    destination: "CXB",
    defaultNights: 3,
    minNights: 2,
    maxNights: 6,
    tier: 4,
    meal: "breakfast",
    tags: ["Domestic", "Beach"],
    highlights: ["Marine Drive to Inani", "Saint Martin day trip", "Sea-view room"],
    itinerary: [
      { title: "Arrive Cox's Bazar", text: "Check in, Sugandha beach sunset." },
      { title: "Saint Martin", text: "Ship from Teknaf, island day." },
      { title: "Marine Drive", text: "Himchari & Inani beach." },
      { title: "Depart", text: "Flight back to Dhaka." },
    ],
    includedAddOns: ["transfer"],
  },
  {
    slug: "istanbul-cappadocia",
    name: "Istanbul & Cappadocia",
    destination: "IST",
    defaultNights: 6,
    minNights: 4,
    maxNights: 12,
    tier: 4,
    meal: "breakfast",
    tags: ["History", "Couples"],
    highlights: ["Hot-air balloon option", "Bosphorus cruise", "Hagia Sophia"],
    itinerary: [
      { title: "Arrive Istanbul", text: "Sultanahmet evening walk." },
      { title: "Old city", text: "Hagia Sophia, Blue Mosque, Grand Bazaar." },
      { title: "Bosphorus", text: "Cruise and Galata tower." },
      { title: "Fly to Cappadocia", text: "Cave hotel check-in." },
      { title: "Cappadocia", text: "Balloon ride (optional) & valleys." },
      { title: "Back to Istanbul", text: "Free evening." },
      { title: "Depart", text: "Transfer to IST." },
    ],
    includedAddOns: ["transfer", "citytour", "visa"],
  },
];

export interface HolidayConfig {
  destination: string;
  packageSlug?: string;
  startDate: string;
  nights: number;
  adults: number;
  children: number;
  rooms: number;
  tier: HotelTier;
  meal: MealPlan;
  includeFlights: boolean;
  addOns: string[];
}

export interface HolidayQuote {
  flights: number;
  hotel: number;
  meals: number;
  addOns: { key: string; label: string; amount: number }[];
  subtotal: number;
  packageDiscount: number;
  taxes: number;
  total: number;
  perPerson: number;
}

export interface HolidayBooking {
  ref: string;
  createdAt: string;
  config: HolidayConfig;
  quote: HolidayQuote;
  leadName: string;
  email: string;
  phone: string;
  notes?: string;
}

export function findDestination(code: string) {
  return DESTINATIONS.find((d) => d.code === code);
}

export function findPackage(slug: string) {
  return PACKAGES.find((p) => p.slug === slug);
}

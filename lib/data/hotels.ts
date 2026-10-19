export interface HotelCity {
  city: string;
  country: string;
  neighborhoods: string[];
  baseRate: number;
}

export const HOTEL_CITIES: HotelCity[] = [
  { city: "Cox's Bazar", country: "Bangladesh", neighborhoods: ["Kolatoli", "Sugandha Beach", "Inani", "Marine Drive"], baseRate: 6500 },
  { city: "Dhaka", country: "Bangladesh", neighborhoods: ["Gulshan", "Banani", "Dhanmondi", "Uttara", "Motijheel"], baseRate: 8500 },
  { city: "Sylhet", country: "Bangladesh", neighborhoods: ["Zindabazar", "Srimangal", "Airport Road"], baseRate: 5200 },
  { city: "Chattogram", country: "Bangladesh", neighborhoods: ["Agrabad", "GEC Circle", "Patenga"], baseRate: 6000 },
  { city: "Bandarban", country: "Bangladesh", neighborhoods: ["Nilgiri", "Meghla", "Town Centre"], baseRate: 4800 },
  { city: "Dubai", country: "United Arab Emirates", neighborhoods: ["Downtown", "Dubai Marina", "Deira", "Jumeirah"], baseRate: 16000 },
  { city: "Bangkok", country: "Thailand", neighborhoods: ["Sukhumvit", "Silom", "Riverside", "Siam"], baseRate: 7800 },
  { city: "Kuala Lumpur", country: "Malaysia", neighborhoods: ["Bukit Bintang", "KLCC", "Chinatown"], baseRate: 7200 },
  { city: "Singapore", country: "Singapore", neighborhoods: ["Marina Bay", "Orchard", "Sentosa", "Little India"], baseRate: 19000 },
  { city: "Kathmandu", country: "Nepal", neighborhoods: ["Thamel", "Lazimpat", "Durbar Marg"], baseRate: 5400 },
  { city: "Malé", country: "Maldives", neighborhoods: ["Hulhumalé", "North Malé Atoll", "South Malé Atoll"], baseRate: 24000 },
];

export const HOTEL_NAME_PARTS = {
  prefix: ["The", "Grand", "Royal", "Ocean", "Sayeman", "Long Beach", "Seagull", "Pan Pacific", "Le Méridien", "Radisson", "Hotel", "Golden", "Sea Pearl", "Azure"],
  suffix: ["Resort & Spa", "Hotel", "Suites", "Inn", "Residency", "Palace", "Retreat", "Bay Hotel", "Boutique Hotel"],
};

export const HOTEL_AMENITIES = [
  "Free WiFi",
  "Swimming Pool",
  "Breakfast",
  "Airport Shuttle",
  "Gym",
  "Spa",
  "Parking",
  "Restaurant",
  "Beach Access",
  "Air Conditioning",
  "24h Front Desk",
  "Family Rooms",
];

export function searchCities(term: string, limit = 8): HotelCity[] {
  const q = term.trim().toLowerCase();
  if (!q) return HOTEL_CITIES.slice(0, limit);
  return HOTEL_CITIES.filter(
    (c) =>
      c.city.toLowerCase().includes(q) ||
      c.country.toLowerCase().includes(q) ||
      c.neighborhoods.some((n) => n.toLowerCase().includes(q)),
  ).slice(0, limit);
}

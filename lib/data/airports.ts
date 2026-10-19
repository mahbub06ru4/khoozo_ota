import type { Airline, Airport } from "@/types";

export const AIRPORTS: Airport[] = [
  { code: "DAC", city: "Dhaka", name: "Hazrat Shahjalal International Airport", country: "Bangladesh" },
  { code: "CGP", city: "Chattogram", name: "Shah Amanat International Airport", country: "Bangladesh" },
  { code: "CXB", city: "Cox's Bazar", name: "Cox's Bazar Airport", country: "Bangladesh" },
  { code: "ZYL", city: "Sylhet", name: "Osmani International Airport", country: "Bangladesh" },
  { code: "JSR", city: "Jashore", name: "Jashore Airport", country: "Bangladesh" },
  { code: "RJH", city: "Rajshahi", name: "Shah Makhdum Airport", country: "Bangladesh" },
  { code: "SPD", city: "Saidpur", name: "Saidpur Airport", country: "Bangladesh" },
  { code: "BZL", city: "Barishal", name: "Barishal Airport", country: "Bangladesh" },
  { code: "DXB", city: "Dubai", name: "Dubai International Airport", country: "United Arab Emirates" },
  { code: "AUH", city: "Abu Dhabi", name: "Zayed International Airport", country: "United Arab Emirates" },
  { code: "DOH", city: "Doha", name: "Hamad International Airport", country: "Qatar" },
  { code: "JED", city: "Jeddah", name: "King Abdulaziz International Airport", country: "Saudi Arabia" },
  { code: "RUH", city: "Riyadh", name: "King Khalid International Airport", country: "Saudi Arabia" },
  { code: "MCT", city: "Muscat", name: "Muscat International Airport", country: "Oman" },
  { code: "KUL", city: "Kuala Lumpur", name: "Kuala Lumpur International Airport", country: "Malaysia" },
  { code: "SIN", city: "Singapore", name: "Changi Airport", country: "Singapore" },
  { code: "BKK", city: "Bangkok", name: "Suvarnabhumi Airport", country: "Thailand" },
  { code: "CCU", city: "Kolkata", name: "Netaji Subhas Chandra Bose International Airport", country: "India" },
  { code: "DEL", city: "New Delhi", name: "Indira Gandhi International Airport", country: "India" },
  { code: "BOM", city: "Mumbai", name: "Chhatrapati Shivaji Maharaj International Airport", country: "India" },
  { code: "KTM", city: "Kathmandu", name: "Tribhuvan International Airport", country: "Nepal" },
  { code: "MLE", city: "Malé", name: "Velana International Airport", country: "Maldives" },
  { code: "CMB", city: "Colombo", name: "Bandaranaike International Airport", country: "Sri Lanka" },
  { code: "IST", city: "Istanbul", name: "Istanbul Airport", country: "Türkiye" },
  { code: "LHR", city: "London", name: "Heathrow Airport", country: "United Kingdom" },
  { code: "JFK", city: "New York", name: "John F. Kennedy International Airport", country: "United States" },
  { code: "YYZ", city: "Toronto", name: "Toronto Pearson International Airport", country: "Canada" },
  { code: "SYD", city: "Sydney", name: "Sydney Kingsford Smith Airport", country: "Australia" },
  { code: "NRT", city: "Tokyo", name: "Narita International Airport", country: "Japan" },
  { code: "CAN", city: "Guangzhou", name: "Guangzhou Baiyun International Airport", country: "China" },
];

export const DOMESTIC_CODES = new Set(["DAC", "CGP", "CXB", "ZYL", "JSR", "RJH", "SPD", "BZL"]);

export const AIRLINES: Airline[] = [
  { code: "BG", name: "Biman Bangladesh", color: "#0f766e" },
  { code: "BS", name: "US-Bangla Airlines", color: "#1d4ed8" },
  { code: "2A", name: "Air Astra", color: "#7c3aed" },
  { code: "VQ", name: "NOVOAIR", color: "#ea580c" },
  { code: "EK", name: "Emirates", color: "#dc2626" },
  { code: "QR", name: "Qatar Airways", color: "#7f1d1d" },
  { code: "SQ", name: "Singapore Airlines", color: "#b45309" },
  { code: "TK", name: "Turkish Airlines", color: "#be123c" },
  { code: "MH", name: "Malaysia Airlines", color: "#1e3a8a" },
  { code: "FZ", name: "flydubai", color: "#0369a1" },
  { code: "6E", name: "IndiGo", color: "#312e81" },
  { code: "SV", name: "Saudia", color: "#166534" },
];

export function findAirport(code: string): Airport | undefined {
  return AIRPORTS.find((a) => a.code === code);
}

export function findAirline(code: string): Airline | undefined {
  return AIRLINES.find((a) => a.code === code);
}

export function searchAirports(term: string, limit = 8): Airport[] {
  const q = term.trim().toLowerCase();
  if (!q) return AIRPORTS.slice(0, limit);
  return AIRPORTS.filter(
    (a) =>
      a.code.toLowerCase().startsWith(q) ||
      a.city.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q) ||
      a.country.toLowerCase().includes(q),
  )
    .sort((a, b) => Number(b.code.toLowerCase() === q) - Number(a.code.toLowerCase() === q))
    .slice(0, limit);
}

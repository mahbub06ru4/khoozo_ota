export type VisaType = "tourist" | "student" | "business" | "work" | "transit";

export const VISA_TYPE_LABEL: Record<VisaType, string> = {
  tourist: "Tourist",
  student: "Student",
  business: "Business",
  work: "Work",
  transit: "Transit",
};

export interface VisaCountry {
  code: string;
  name: string;
  region: "Asia" | "Middle East" | "Europe" | "North America" | "Oceania";
  flag: string;
  types: VisaType[];
  popularFor?: VisaType;
}

export const VISA_COUNTRIES: VisaCountry[] = [
  { code: "AE", name: "United Arab Emirates", region: "Middle East", flag: "🇦🇪", types: ["tourist", "business", "work", "transit"], popularFor: "tourist" },
  { code: "SA", name: "Saudi Arabia", region: "Middle East", flag: "🇸🇦", types: ["tourist", "business", "work"] },
  { code: "QA", name: "Qatar", region: "Middle East", flag: "🇶🇦", types: ["tourist", "business", "work", "transit"] },
  { code: "TR", name: "Türkiye", region: "Europe", flag: "🇹🇷", types: ["tourist", "student", "business"] },
  { code: "TH", name: "Thailand", region: "Asia", flag: "🇹🇭", types: ["tourist", "student", "business"], popularFor: "tourist" },
  { code: "MY", name: "Malaysia", region: "Asia", flag: "🇲🇾", types: ["tourist", "student", "business", "work"], popularFor: "student" },
  { code: "SG", name: "Singapore", region: "Asia", flag: "🇸🇬", types: ["tourist", "student", "business"] },
  { code: "IN", name: "India", region: "Asia", flag: "🇮🇳", types: ["tourist", "student", "business", "transit"], popularFor: "tourist" },
  { code: "CN", name: "China", region: "Asia", flag: "🇨🇳", types: ["tourist", "student", "business"], popularFor: "student" },
  { code: "JP", name: "Japan", region: "Asia", flag: "🇯🇵", types: ["tourist", "student", "business", "work"] },
  { code: "KR", name: "South Korea", region: "Asia", flag: "🇰🇷", types: ["tourist", "student", "business", "work"] },
  { code: "GB", name: "United Kingdom", region: "Europe", flag: "🇬🇧", types: ["tourist", "student", "business", "work", "transit"], popularFor: "student" },
  { code: "DE", name: "Germany", region: "Europe", flag: "🇩🇪", types: ["tourist", "student", "business", "work"], popularFor: "student" },
  { code: "FR", name: "France", region: "Europe", flag: "🇫🇷", types: ["tourist", "student", "business"] },
  { code: "IT", name: "Italy", region: "Europe", flag: "🇮🇹", types: ["tourist", "student", "business"] },
  { code: "NL", name: "Netherlands", region: "Europe", flag: "🇳🇱", types: ["tourist", "student", "business"] },
  { code: "SE", name: "Sweden", region: "Europe", flag: "🇸🇪", types: ["tourist", "student", "work"] },
  { code: "FI", name: "Finland", region: "Europe", flag: "🇫🇮", types: ["tourist", "student", "work"] },
  { code: "HU", name: "Hungary", region: "Europe", flag: "🇭🇺", types: ["tourist", "student"] },
  { code: "US", name: "United States", region: "North America", flag: "🇺🇸", types: ["tourist", "student", "business", "work", "transit"], popularFor: "student" },
  { code: "CA", name: "Canada", region: "North America", flag: "🇨🇦", types: ["tourist", "student", "business", "work"], popularFor: "student" },
  { code: "AU", name: "Australia", region: "Oceania", flag: "🇦🇺", types: ["tourist", "student", "business", "work"], popularFor: "student" },
  { code: "NZ", name: "New Zealand", region: "Oceania", flag: "🇳🇿", types: ["tourist", "student", "work"] },
];

export function findVisaCountry(code: string): VisaCountry | undefined {
  return VISA_COUNTRIES.find((c) => c.code === code.toUpperCase());
}

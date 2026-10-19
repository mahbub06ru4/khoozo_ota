export type Currency = "BDT" | "USD";
export type TripType = "oneway" | "roundtrip" | "multicity";
export type CabinClass = "Economy" | "Premium Economy" | "Business" | "First";
export type SearchKind = "flight" | "hotel";

export interface Airport {
  code: string;
  city: string;
  name: string;
  country: string;
}

export interface Airline {
  code: string;
  name: string;
  color: string;
}

export interface PassengerCount {
  adults: number;
  children: number;
  infants: number;
}

export interface FlightLeg {
  origin: string;
  destination: string;
  date: string;
}

export interface FlightSearchQuery {
  kind: "flight";
  tripType: TripType;
  legs: FlightLeg[];
  returnDate?: string;
  passengers: PassengerCount;
  cabin: CabinClass;
}

export interface RoomConfig {
  adults: number;
  children: number;
}

export interface HotelSearchQuery {
  kind: "hotel";
  destination: string;
  checkIn: string;
  checkOut: string;
  rooms: RoomConfig[];
}

export type SearchQuery = FlightSearchQuery | HotelSearchQuery;

export interface FlightSegment {
  flightNumber: string;
  airline: string;
  origin: string;
  destination: string;
  departure: string;
  arrival: string;
  durationMin: number;
}

export interface FlightOffer {
  id: string;
  airline: string;
  segments: FlightSegment[];
  stops: number;
  totalDurationMin: number;
  cabin: CabinClass;
  baggage: { cabinKg: number; checkedKg: number };
  refundable: boolean;
  seatsLeft: number;
  price: { base: number; taxes: number; currency: "BDT" };
}

export interface HotelOffer {
  id: string;
  name: string;
  city: string;
  neighborhood: string;
  stars: number;
  rating: number;
  reviews: number;
  amenities: string[];
  image: string;
  freeCancellation: boolean;
  breakfastIncluded: boolean;
  pricePerNight: { base: number; taxes: number; currency: "BDT" };
}

export interface FlightFilters {
  stops: number[];
  maxPrice: number | null;
  airlines: string[];
  departureWindows: TimeWindow[];
  arrivalWindows: TimeWindow[];
  refundableOnly: boolean;
}

export interface HotelFilters {
  stars: number[];
  maxPrice: number | null;
  neighborhoods: string[];
  amenities: string[];
  freeCancellationOnly: boolean;
}

export type TimeWindow = "early" | "morning" | "afternoon" | "evening";
export type SortKey = "cheapest" | "fastest" | "earliest" | "best";

export type CartItem =
  | { kind: "flight"; offer: FlightOffer; query: FlightSearchQuery }
  | { kind: "hotel"; offer: HotelOffer; query: HotelSearchQuery; nights: number };

export interface Traveller {
  title: "Mr" | "Ms" | "Mrs" | "Mstr" | "Miss";
  firstName: string;
  lastName: string;
  dob: string;
  nationality: string;
  passportNumber: string;
  passportExpiry: string;
  type: "adult" | "child" | "infant";
}

export interface ContactInfo {
  email: string;
  phone: string;
}

export interface Booking {
  pnr: string;
  createdAt: string;
  item: CartItem;
  travellers: Traveller[];
  contact: ContactInfo;
  amount: number;
  paymentMethod: string;
}

export interface FareBreakdown {
  base: number;
  taxes: number;
  serviceFee: number;
  discount: number;
  total: number;
}

export type VisaTypeKey = "tourist" | "student" | "business" | "work" | "transit";

export interface VisaProduct {
  id: string;
  countryCode: string;
  type: VisaTypeKey;
  nationality: string;
  mode: "e-Visa" | "Embassy / VFS" | "Visa on arrival";
  permitName: string;
  processingDays: { min: number; max: number };
  validity: string;
  maxStay: string;
  entry: "Single" | "Multiple";
  governmentFee: number;
  serviceFee: number;
  documents: string[];
  notes: string[];
  student?: {
    acceptanceDoc: string;
    proofOfFunds: string;
    language: string;
    workRights: string;
    postStudy: string;
  };
}

export interface VisaApplicant {
  firstName: string;
  lastName: string;
  dob: string;
  passportNumber: string;
  passportExpiry: string;
  email: string;
  phone: string;
  travelDate: string;
  institution?: string;
  course?: string;
  intake?: string;
}

export interface VisaApplication {
  id: string;
  createdAt: string;
  product: VisaProduct;
  applicant: VisaApplicant;
  documents: string[];
  status: "submitted" | "in_review" | "approved" | "rejected";
  amount: number;
}

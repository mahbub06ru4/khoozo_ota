import { z } from "zod";

const iata = z.string().regex(/^[A-Z]{3}$/, "Must be a 3-letter IATA code");
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD");

export const flightSearchSchema = z
  .object({
    kind: z.literal("flight"),
    tripType: z.enum(["oneway", "roundtrip", "multicity"]),
    legs: z.array(z.object({ origin: iata, destination: iata, date: isoDate })).min(1).max(5),
    returnDate: isoDate.optional(),
    passengers: z.object({
      adults: z.number().int().min(1).max(9),
      children: z.number().int().min(0).max(8),
      infants: z.number().int().min(0).max(4),
    }),
    cabin: z.enum(["Economy", "Premium Economy", "Business", "First"]),
  })
  .refine((q) => q.legs.every((l) => l.origin !== l.destination), { message: "Origin and destination must differ" })
  .refine((q) => q.passengers.infants <= q.passengers.adults, { message: "Each infant needs an adult" })
  .refine((q) => q.passengers.adults + q.passengers.children <= 9, { message: "Max 9 seated passengers" })
  .refine((q) => q.tripType !== "roundtrip" || (q.returnDate && q.returnDate >= q.legs[0].date), {
    message: "Return date must be on/after departure",
  });

export const hotelSearchSchema = z
  .object({
    kind: z.literal("hotel"),
    destination: z.string().trim().min(2).max(80),
    checkIn: isoDate,
    checkOut: isoDate,
    rooms: z
      .array(z.object({ adults: z.number().int().min(1).max(4), children: z.number().int().min(0).max(3) }))
      .min(1)
      .max(6),
  })
  .refine((q) => q.checkOut > q.checkIn, { message: "Check-out must be after check-in" });

export const visaTypeSchema = z.enum(["tourist", "student", "business", "work", "transit"]);

export const visaApplicationSchema = z
  .object({
    countryCode: z.string().regex(/^[A-Z]{2}$/),
    type: visaTypeSchema,
    nationality: z.string().min(2).max(40),
    applicant: z.object({
      firstName: z.string().trim().min(1).max(50),
      lastName: z.string().trim().min(1).max(50),
      dob: isoDate,
      passportNumber: z.string().regex(/^[A-Z0-9]{6,9}$/),
      passportExpiry: isoDate,
      email: z.string().email(),
      phone: z.string().regex(/^(?:\+?88)?01[3-9]\d{8}$/),
      travelDate: isoDate,
      institution: z.string().trim().max(120).optional(),
      course: z.string().trim().max(120).optional(),
      intake: z.string().trim().max(40).optional(),
    }),
    documents: z.array(z.string().max(200)).max(30),
  })
  .refine((v) => v.type !== "student" || (v.applicant.institution && v.applicant.course), {
    message: "Institution and course are required for student visas",
  });

export const holidayConfigSchema = z
  .object({
    destination: z.string().min(3).max(4),
    packageSlug: z.string().max(80).optional(),
    startDate: isoDate,
    nights: z.number().int().min(1).max(21),
    adults: z.number().int().min(1).max(12),
    children: z.number().int().min(0).max(8),
    rooms: z.number().int().min(1).max(8),
    tier: z.union([z.literal(3), z.literal(4), z.literal(5)]),
    meal: z.enum(["room", "breakfast", "halfboard", "fullboard"]),
    includeFlights: z.boolean(),
    addOns: z.array(z.string().max(30)).max(10),
  })
  .refine((c) => c.rooms <= c.adults, { message: "Each room needs at least one adult" })
  .refine((c) => c.adults + c.children <= c.rooms * 4, { message: "Max 4 guests per room" });

export const holidayBookingSchema = z.object({
  config: holidayConfigSchema,
  leadName: z.string().trim().min(2).max(80),
  email: z.string().email(),
  phone: z.string().regex(/^(?:\+?88)?01[3-9]\d{8}$/),
  notes: z.string().max(500).optional(),
  expectedTotal: z.number().nonnegative(),
});

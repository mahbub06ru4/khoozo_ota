import type { ContactInfo, Traveller } from "@/types";

export type Errors = Record<string, string>;

const NAME_RE = /^[A-Za-z][A-Za-z .'-]{0,48}$/;
const PASSPORT_RE = /^[A-Z0-9]{6,9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const BD_PHONE_RE = /^(?:\+?88)?01[3-9]\d{8}$/;

function ageOn(dob: string, ref: string): number {
  const d = new Date(`${dob}T00:00:00`);
  const r = new Date(`${ref}T00:00:00`);
  let age = r.getFullYear() - d.getFullYear();
  if (r.getMonth() < d.getMonth() || (r.getMonth() === d.getMonth() && r.getDate() < d.getDate())) age--;
  return age;
}

export function validateTraveller(t: Traveller, idx: number, travelDate: string, international: boolean): Errors {
  const e: Errors = {};
  const k = (f: string) => `t${idx}.${f}`;
  if (!NAME_RE.test(t.firstName.trim())) e[k("firstName")] = "Use letters only, as on passport";
  if (!NAME_RE.test(t.lastName.trim())) e[k("lastName")] = "Use letters only, as on passport";
  if (!t.dob) e[k("dob")] = "Date of birth is required";
  else {
    const age = ageOn(t.dob, travelDate);
    if (age < 0 || new Date(t.dob) > new Date()) e[k("dob")] = "Date of birth can't be in the future";
    else if (t.type === "adult" && age < 12) e[k("dob")] = "Adults must be 12+ on travel date";
    else if (t.type === "child" && (age < 2 || age > 11)) e[k("dob")] = "Children must be 2–11 on travel date";
    else if (t.type === "infant" && age >= 2) e[k("dob")] = "Infants must be under 2 on travel date";
  }
  if (international) {
    if (!t.nationality) e[k("nationality")] = "Select nationality";
    if (!PASSPORT_RE.test(t.passportNumber.trim().toUpperCase())) e[k("passportNumber")] = "6–9 letters/digits";
    if (!t.passportExpiry) e[k("passportExpiry")] = "Expiry date is required";
    else {
      const sixMonths = new Date(`${travelDate}T00:00:00`);
      sixMonths.setMonth(sixMonths.getMonth() + 6);
      if (new Date(`${t.passportExpiry}T00:00:00`) < sixMonths) e[k("passportExpiry")] = "Must be valid 6 months beyond travel";
    }
  }
  return e;
}

export function validateContact(c: ContactInfo): Errors {
  const e: Errors = {};
  if (!EMAIL_RE.test(c.email.trim())) e["contact.email"] = "Enter a valid email";
  if (!BD_PHONE_RE.test(c.phone.replace(/[\s-]/g, ""))) e["contact.phone"] = "Enter a valid BD mobile (01XXXXXXXXX)";
  return e;
}

export function luhnValid(num: string): boolean {
  const digits = num.replace(/\D/g, "");
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let dbl = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = Number(digits[i]);
    if (dbl) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    dbl = !dbl;
  }
  return sum % 10 === 0;
}

export function cardBrand(num: string): "visa" | "mastercard" | "amex" | null {
  const d = num.replace(/\D/g, "");
  if (/^4/.test(d)) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(d)) return "mastercard";
  if (/^3[47]/.test(d)) return "amex";
  return null;
}

export function expiryValid(mmYY: string): boolean {
  const m = /^(\d{2})\/(\d{2})$/.exec(mmYY);
  if (!m) return false;
  const month = Number(m[1]);
  if (month < 1 || month > 12) return false;
  const end = new Date(2000 + Number(m[2]), month, 0, 23, 59, 59);
  return end >= new Date();
}

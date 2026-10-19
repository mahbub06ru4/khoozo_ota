import "server-only";
import { findVisaCountry } from "@/lib/data/visas";
import { hashString, seededRandom } from "@/lib/utils";
import type { VisaProduct, VisaTypeKey } from "@/types";

export interface VisaProvider {
  readonly name: string;
  getProduct(countryCode: string, type: VisaTypeKey, nationality: string): Promise<VisaProduct | null>;
}

const BASE_DOCS = [
  "Passport valid 6+ months with 2 blank pages",
  "Recent passport-size photo (white background)",
  "Bank statement (last 6 months) with solvency certificate",
  "National ID card copy",
];

const TYPE_DOCS: Record<VisaTypeKey, string[]> = {
  tourist: ["Return flight reservation", "Hotel booking / invitation letter", "Employment letter / trade licence + NOC", "Income tax return (TIN)"],
  student: [],
  business: ["Invitation letter from host company", "Company trade licence & visiting card", "Company bank statement", "Cover letter on letterhead"],
  work: ["Employment contract / job offer", "Work permit / quota approval from employer", "Educational & experience certificates", "Medical fitness report", "Police clearance certificate"],
  transit: ["Confirmed onward ticket", "Visa for final destination (if required)"],
};

interface StudentProfile {
  permitName: string;
  acceptanceDoc: string;
  proofOfFunds: string;
  language: string;
  workRights: string;
  postStudy: string;
  extraDocs: string[];
  govFeeBdt: number;
}

const STUDENT: Record<string, StudentProfile> = {
  GB: { permitName: "Student visa (Student route)", acceptanceDoc: "CAS from licensed sponsor", proofOfFunds: "Tuition + £1,334/month (London) for 9 months, held 28 days", language: "IELTS UKVI 5.5–6.5 or CAS-assessed", workRights: "20 hrs/week in term", postStudy: "Graduate Route — 2 years (3 for PhD)", extraDocs: ["TB test certificate (IOM)", "Immigration Health Surcharge receipt", "ATAS certificate (certain STEM courses)"], govFeeBdt: 66000 },
  US: { permitName: "F-1 Student visa", acceptanceDoc: "Form I-20 + SEVIS I-901 fee receipt", proofOfFunds: "First-year cost of attendance as shown on I-20", language: "TOEFL / IELTS / Duolingo per university", workRights: "On-campus 20 hrs/week; CPT during program", postStudy: "OPT 12 months (+24 STEM extension)", extraDocs: ["DS-160 confirmation", "Visa interview appointment letter", "Academic transcripts & certificates"], govFeeBdt: 22000 },
  CA: { permitName: "Study permit", acceptanceDoc: "Letter of Acceptance (DLI) + Provincial Attestation Letter", proofOfFunds: "CAD 20,635 + first-year tuition (GIC accepted)", language: "IELTS Academic 6.0+ (SDS 6.0 each band)", workRights: "24 hrs/week off-campus in term", postStudy: "PGWP up to 3 years (eligible programs)", extraDocs: ["Biometrics", "Upfront medical exam", "Statement of purpose"], govFeeBdt: 15000 },
  AU: { permitName: "Student visa (Subclass 500)", acceptanceDoc: "Confirmation of Enrolment (CoE)", proofOfFunds: "AUD 29,710/year + tuition + travel", language: "IELTS 6.0 / PTE 50 (Genuine Student requirement)", workRights: "48 hrs per fortnight in term", postStudy: "Temporary Graduate (485) 2–4 years", extraDocs: ["OSHC health cover", "Genuine Student statement", "Biometrics & health exam"], govFeeBdt: 175000 },
  DE: { permitName: "National (D) visa for study", acceptanceDoc: "University admission (Zulassungsbescheid)", proofOfFunds: "Blocked account €11,904/year", language: "IELTS 6.5 (English) or TestDaF/DSH (German)", workRights: "140 full / 280 half days per year", postStudy: "18-month job-seeker residence permit", extraDocs: ["APS certificate", "Travel health insurance", "Motivation letter & CV"], govFeeBdt: 10000 },
  MY: { permitName: "Student Pass (EMGS)", acceptanceDoc: "Offer letter + EMGS e-VAL", proofOfFunds: "Sponsor letter / bank statement covering tuition & living", language: "IELTS 5.5 or institution test", workRights: "20 hrs/week during semester breaks", postStudy: "Limited — employer-sponsored pass", extraDocs: ["EMGS medical screening", "Personal bond"], govFeeBdt: 30000 },
  CN: { permitName: "X1 / X2 Student visa", acceptanceDoc: "Admission notice + JW201/JW202 form", proofOfFunds: "Scholarship letter (CSC) or bank statement", language: "HSK for Chinese-taught; IELTS for English-taught", workRights: "Part-time with university approval", postStudy: "Limited", extraDocs: ["Physical examination record", "Police clearance"], govFeeBdt: 7500 },
};

function studentProfile(code: string): StudentProfile {
  return (
    STUDENT[code] ?? {
      permitName: "Student / long-stay study visa",
      acceptanceDoc: "Unconditional offer / admission letter",
      proofOfFunds: "Tuition receipt + living costs for first year",
      language: "IELTS 6.0 or equivalent",
      workRights: "Part-time permitted (country rules apply)",
      postStudy: "Varies by country",
      extraDocs: ["Health insurance", "Statement of purpose"],
      govFeeBdt: 12000,
    }
  );
}

const MODE_BY_COUNTRY: Record<string, VisaProduct["mode"]> = {
  AE: "e-Visa", SA: "e-Visa", QA: "e-Visa", TR: "e-Visa", TH: "e-Visa", MY: "e-Visa", SG: "e-Visa", IN: "e-Visa", AU: "e-Visa", NZ: "e-Visa", KR: "Embassy / VFS",
};

export const mockVisaProvider: VisaProvider = {
  name: "mock",
  async getProduct(countryCode, type, nationality) {
    const country = findVisaCountry(countryCode);
    if (!country || !country.types.includes(type)) return null;
    const rand = seededRandom(hashString(`${country.code}-${type}-${nationality}`));
    const isStudent = type === "student";
    const sp = isStudent ? studentProfile(country.code) : null;
    const mode: VisaProduct["mode"] = isStudent || type === "work" ? "Embassy / VFS" : (MODE_BY_COUNTRY[country.code] ?? "Embassy / VFS");
    const procMin = mode === "e-Visa" ? 3 + Math.floor(rand() * 3) : 10 + Math.floor(rand() * 15);
    const governmentFee = sp ? sp.govFeeBdt : Math.round((4000 + rand() * 14000) / 100) * 100;

    return {
      id: `VZ-${country.code}-${type}`,
      countryCode: country.code,
      type,
      nationality,
      mode,
      permitName: sp?.permitName ?? `${type[0].toUpperCase()}${type.slice(1)} visa`,
      processingDays: { min: procMin, max: procMin + (mode === "e-Visa" ? 4 : 20) },
      validity: isStudent ? "Duration of course" : type === "work" ? "1–2 years (renewable)" : type === "transit" ? "96 hours" : rand() > 0.5 ? "90 days" : "60 days",
      maxStay: isStudent ? "Course length + grace period" : type === "transit" ? "96 hours" : type === "work" ? "As per contract" : rand() > 0.5 ? "30 days" : "14 days",
      entry: isStudent || type === "work" || rand() > 0.6 ? "Multiple" : "Single",
      governmentFee,
      serviceFee: isStudent ? 4500 : 2500,
      documents: [...BASE_DOCS, ...(sp ? [sp.acceptanceDoc, "Academic certificates & transcripts", "English test score report", ...sp.extraDocs] : TYPE_DOCS[type])],
      notes: [
        "Requirements are indicative; final decision rests with the embassy / immigration authority.",
        "Service fee is non-refundable once the application is lodged.",
        ...(mode === "Embassy / VFS" ? ["Biometric appointment at VFS / embassy in Dhaka may be required."] : []),
      ],
      student: sp ? { acceptanceDoc: sp.acceptanceDoc, proofOfFunds: sp.proofOfFunds, language: sp.language, workRights: sp.workRights, postStudy: sp.postStudy } : undefined,
    };
  },
};

export function getVisaProvider(): VisaProvider {
  return mockVisaProvider;
}

import { NextResponse } from "next/server";
import { visaApplicationSchema } from "@/lib/schemas";
import { generatePnr } from "@/lib/utils";
import { getVisaProvider } from "@/services/visa";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = visaApplicationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid application" }, { status: 400 });
  }
  const { countryCode, type, nationality, applicant, documents } = parsed.data;
  const product = await getVisaProvider().getProduct(countryCode, type, nationality);
  if (!product) return NextResponse.json({ error: "Visa product unavailable" }, { status: 404 });
  if (applicant.passportExpiry <= applicant.travelDate) {
    return NextResponse.json({ error: "Passport must be valid beyond your travel date" }, { status: 400 });
  }

  return NextResponse.json({
    application: {
      id: `KZV-${generatePnr()}`,
      createdAt: new Date().toISOString(),
      product,
      applicant,
      documents,
      status: "submitted",
      amount: product.governmentFee + product.serviceFee,
    },
  });
}

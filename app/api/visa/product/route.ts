import { NextResponse } from "next/server";
import { visaTypeSchema } from "@/lib/schemas";
import { getVisaProvider } from "@/services/visa";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const country = (url.searchParams.get("country") ?? "").toUpperCase();
  const type = visaTypeSchema.safeParse(url.searchParams.get("type"));
  const nationality = url.searchParams.get("nationality") ?? "Bangladeshi";
  if (!/^[A-Z]{2}$/.test(country) || !type.success) {
    return NextResponse.json({ error: "Invalid country or visa type" }, { status: 400 });
  }
  const product = await getVisaProvider().getProduct(country, type.data, nationality);
  if (!product) return NextResponse.json({ error: "This visa type is not offered for the selected country" }, { status: 404 });
  return NextResponse.json({ product });
}

import { NextResponse } from "next/server";
import { flightSearchSchema } from "@/lib/schemas";
import { getProvider, ProviderError } from "@/services";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = flightSearchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request" }, { status: 400 });
  }

  try {
    const provider = getProvider();
    const offers = await provider.searchFlights(parsed.data);
    return NextResponse.json({ provider: provider.name, offers });
  } catch (err) {
    const status = err instanceof ProviderError ? err.status : 500;
    console.error("[flights/search]", err);
    return NextResponse.json({ error: "Flight search is temporarily unavailable" }, { status });
  }
}

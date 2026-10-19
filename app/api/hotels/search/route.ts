import { NextResponse } from "next/server";
import { hotelSearchSchema } from "@/lib/schemas";
import { getProvider, ProviderError } from "@/services";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = hotelSearchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request" }, { status: 400 });
  }

  try {
    const provider = getProvider();
    const offers = await provider.searchHotels(parsed.data);
    return NextResponse.json({ provider: provider.name, offers });
  } catch (err) {
    const status = err instanceof ProviderError ? err.status : 500;
    console.error("[hotels/search]", err);
    return NextResponse.json({ error: "Hotel search is temporarily unavailable" }, { status });
  }
}

import { NextResponse } from "next/server";
import { quoteHoliday } from "@/lib/holiday-pricing";
import { holidayBookingSchema } from "@/lib/schemas";
import { generatePnr, todayISO } from "@/lib/utils";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = holidayBookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request" }, { status: 400 });
  }
  const { config, leadName, email, phone, notes, expectedTotal } = parsed.data;
  if (config.startDate <= todayISO()) return NextResponse.json({ error: "Start date must be in the future" }, { status: 400 });

  const quote = quoteHoliday(config);
  if (!quote) return NextResponse.json({ error: "Unknown destination" }, { status: 404 });
  if (quote.total !== expectedTotal) {
    return NextResponse.json({ error: "Price has changed — please review the updated total", quote }, { status: 409 });
  }

  return NextResponse.json({
    booking: { ref: `KZH-${generatePnr()}`, createdAt: new Date().toISOString(), config, quote, leadName, email, phone, notes },
  });
}

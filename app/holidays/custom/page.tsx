import type { Metadata } from "next";
import { HolidayBuilder } from "@/components/holidays/HolidayBuilder";
import { findDestination } from "@/lib/data/holidays";

export const metadata: Metadata = { title: "Customise your holiday" };

export default async function CustomHolidayPage({ searchParams }: { searchParams: Promise<{ dest?: string }> }) {
  const { dest } = await searchParams;
  const initial = dest && findDestination(dest) ? dest : undefined;
  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-extrabold tracking-tight">Customise your holiday</h1>
      <p className="mb-8 mt-1 text-ink-500">Build a trip around you — the price updates as you go.</p>
      <HolidayBuilder key={initial ?? "default"} initialDestination={initial} />
    </div>
  );
}

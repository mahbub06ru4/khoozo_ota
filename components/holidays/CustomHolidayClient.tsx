"use client";

import { useSearchParams } from "next/navigation";
import { findDestination } from "@/lib/data/holidays";
import { HolidayBuilder } from "./HolidayBuilder";

export function CustomHolidayClient() {
  const dest = useSearchParams().get("dest");
  const initial = dest && findDestination(dest) ? dest : undefined;
  return <HolidayBuilder key={initial ?? "default"} initialDestination={initial} />;
}

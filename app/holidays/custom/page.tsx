import type { Metadata } from "next";
import { Suspense } from "react";
import { CustomHolidayClient } from "@/components/holidays/CustomHolidayClient";

export const metadata: Metadata = { title: "Customise your holiday" };

export default function CustomHolidayPage() {
  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-extrabold tracking-tight">Customise your holiday</h1>
      <p className="mb-8 mt-1 text-ink-500">Build a trip around you — the price updates as you go.</p>
      <Suspense fallback={<div className="skeleton h-96 rounded-2xl" />}>
        <CustomHolidayClient />
      </Suspense>
    </div>
  );
}

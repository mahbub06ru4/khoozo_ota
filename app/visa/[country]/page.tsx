import { notFound } from "next/navigation";
import { Suspense } from "react";
import { VisaDetails } from "@/components/visa/VisaDetails";
import { findVisaCountry, VISA_COUNTRIES } from "@/lib/data/visas";

export function generateStaticParams() {
  return VISA_COUNTRIES.map((c) => ({ country: c.code.toLowerCase() }));
}

export async function generateMetadata({ params }: { params: Promise<{ country: string }> }) {
  const { country } = await params;
  const c = findVisaCountry(country);
  return { title: c ? `${c.name} visa` : "Visa" };
}

export default async function VisaCountryPage({ params }: { params: Promise<{ country: string }> }) {
  const { country } = await params;
  const c = findVisaCountry(country);
  if (!c) notFound();
  return (
    <Suspense fallback={<div className="container-page py-8"><div className="skeleton h-96 rounded-2xl" /></div>}>
      <VisaDetails country={c} />
    </Suspense>
  );
}

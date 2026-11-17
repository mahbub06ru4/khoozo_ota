import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ResultsView } from "@/components/results/ResultsView";
import { ResultsSkeleton } from "@/components/results/Skeletons";

const KINDS = { flights: "flight", hotels: "hotel" } as const;

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(KINDS).map((kind) => ({ kind }));
}

export async function generateMetadata({ params }: { params: Promise<{ kind: string }> }) {
  const { kind } = await params;
  return { title: kind === "hotels" ? "Hotel results" : "Flight results" };
}

export default async function SearchPage({ params }: { params: Promise<{ kind: string }> }) {
  const { kind } = await params;
  const k = KINDS[kind as keyof typeof KINDS];
  if (!k) notFound();

  return (
    <Suspense
      fallback={
        <div className="container-page py-6">
          <ResultsSkeleton />
        </div>
      }
    >
      <ResultsView kind={k} />
    </Suspense>
  );
}

import type { Metadata } from "next";
import { PromoGrid } from "@/components/home/PromoGrid";

export const metadata: Metadata = { title: "Promotions" };

export default function PromotionsPage() {
  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-extrabold tracking-tight">Promotions & offers</h1>
      <p className="mb-8 mt-1 text-ink-500">Apply a code at checkout. Discounts are capped per booking and cannot be combined.</p>
      <PromoGrid />
    </div>
  );
}

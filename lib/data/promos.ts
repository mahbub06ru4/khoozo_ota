export type PromoCategory = "flight" | "hotel" | "bank" | "holiday";

export interface Promo {
  id: string;
  category: PromoCategory;
  title: string;
  subtitle: string;
  code?: string;
  discountPct: number;
  maxDiscount: number;
  gradient: string;
  image?: string;
  validTill: string;
}

export const PROMOS: Promo[] = [
  { id: "p1", category: "flight", title: "Dhaka to Dubai from ৳38,500", subtitle: "Emirates & flydubai fares, limited seats", code: "DXBDEAL", discountPct: 8, maxDiscount: 3000, gradient: "from-sky-500 to-blue-700", image: "/images/destinations/dubai.jpg", validTill: "2026-12-31" },
  { id: "p2", category: "bank", title: "Up to 15% off with City Bank AMEX", subtitle: "On international flights, every Friday", code: "AMEX15", discountPct: 15, maxDiscount: 5000, gradient: "from-emerald-500 to-teal-700", image: "/images/promos/card.jpg", validTill: "2026-12-31" },
  { id: "p3", category: "hotel", title: "Cox's Bazar beach stays ৳4,999", subtitle: "Sea-view rooms with breakfast", code: "BEACH10", discountPct: 10, maxDiscount: 2500, gradient: "from-amber-400 to-orange-600", image: "/images/destinations/coxs-bazar.jpg", validTill: "2026-11-30" },
  { id: "p4", category: "holiday", title: "Maldives 3N/4D package", subtitle: "Flights + resort + transfers", discountPct: 12, maxDiscount: 15000, gradient: "from-cyan-400 to-sky-700", image: "/images/destinations/maldives.jpg", validTill: "2027-01-31" },
  { id: "p5", category: "bank", title: "bKash cashback 10%", subtitle: "Pay with bKash on domestic flights", code: "BKASH10", discountPct: 10, maxDiscount: 800, gradient: "from-pink-500 to-rose-700", image: "/images/promos/mobile.jpg", validTill: "2026-12-15" },
  { id: "p6", category: "flight", title: "Domestic fares from ৳3,999", subtitle: "Dhaka ⇄ Cox's Bazar, Sylhet, Chattogram", code: "DOM500", discountPct: 5, maxDiscount: 500, gradient: "from-indigo-500 to-violet-700", image: "/images/promos/airline.jpg", validTill: "2026-12-31" },
  { id: "p7", category: "holiday", title: "Bangkok & Pattaya 5N/6D", subtitle: "City tour, island hopping & hotels", discountPct: 10, maxDiscount: 8000, gradient: "from-fuchsia-500 to-purple-700", image: "/images/destinations/bangkok.jpg", validTill: "2027-02-28" },
  { id: "p8", category: "hotel", title: "Kuala Lumpur city hotels 20% off", subtitle: "Bukit Bintang & KLCC properties", code: "KL20", discountPct: 20, maxDiscount: 4000, gradient: "from-teal-400 to-emerald-700", image: "/images/destinations/kuala-lumpur.jpg", validTill: "2026-12-31" },
];

export function findPromoByCode(code: string): Promo | undefined {
  const c = code.trim().toUpperCase();
  return PROMOS.find((p) => p.code === c);
}

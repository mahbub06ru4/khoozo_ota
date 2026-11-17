import Link from "next/link";
import { asset } from "@/lib/runtime";
import { cn } from "@/lib/utils";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-2.5" aria-label="Khoozo home">
      {/* eslint-disable-next-line @next/next/no-img-element -- small static brand mark */}
      <img src={asset("/logo.png")} alt="" width={40} height={40} className="size-10 rounded-full shadow-md shadow-brand-600/30 transition duration-300 group-hover:rotate-[-10deg]" />
      <span className="leading-none">
        <span className={cn("block text-xl font-extrabold tracking-tight", light ? "text-white" : "bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-transparent")}>Khoozo</span>
        <span className={cn("block text-[10px] font-semibold uppercase tracking-[0.2em]", light ? "text-white/60" : "text-ink-500")}>Travel</span>
      </span>
    </Link>
  );
}

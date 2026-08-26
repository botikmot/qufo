import Link from "next/link";
import Image from "next/image";

export function AppBrand() {
  return (
    <Link
      href="/dashboard"
      className="flex items-center gap-4"
    >
      <div className="flex size-10 items-center justify-center rounded-xl bg-cyan-400/[0.06]">
        {/* <span className="text-lg font-semibold text-cyan-300">
          Q
        </span> */}
        <Image 
          src="/images/qufo_logo_variant2.png"
          alt="QUFO"
          width={50}
          height={50}
        />
      </div>

      <div>
        <Image 
          src="/images/qufo_logo2.png"
          alt="QUFO"
          width={130}
          height={50}
        />
        {/* <p className="font-semibold tracking-[0.14em] text-white">
          QUFO
        </p>

        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-600">
          Quick Flow
        </p> */}
      </div>
    </Link>
  );
}
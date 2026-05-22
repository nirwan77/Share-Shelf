import Image from "next/image";
import Link from "next/link";

type ExploreCardProps = {
  src: string;
  name: string;
  aurthur: string;
  link: string;
  price: number;
  lowestPrice?: number | null;
  sellCount?: number;
  tradeCount?: number;
};

export const ExploreCard = ({
  src,
  name,
  aurthur,
  link,
  lowestPrice,
  sellCount,
  tradeCount,
}: ExploreCardProps) => {
  return (
    <Link href={link} className="group block cursor-pointer text-center">
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(150deg,#17171b,#0b0b0d_60%,#050505)] pt-[112%] shadow-[0_20px_60px_rgba(0,0,0,0.34)] transition-all duration-300 group-hover:-translate-y-1 group-hover:border-[#ff9a3d]/45 group-hover:shadow-[0_24px_75px_rgba(255,122,0,0.13)]">
        <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#ff9a3d]/60 to-transparent" />
        <figure className="absolute left-1/2 top-1/2 max-h-[220px] max-w-[52%] -translate-x-1/2 -translate-y-1/2 cursor-pointer shadow-[16px_22px_34px_rgba(0,0,0,0.52)] transition-transform duration-500 group-hover:scale-105">
          <Image
            alt={name}
            src={src}
            className="block max-w-full h-auto max-h-[220px]"
            width={380}
            height={480}
          />
        </figure>
      </div>
      <h3 className="mt-3 line-clamp-2 text-base font-bold text-white transition-colors group-hover:text-[#ffb36d] xl:mt-4">{name}</h3>
      <span className="mt-1 block text-sm text-zinc-400">{aurthur}</span>
      {lowestPrice !== undefined && lowestPrice !== null ? (
        <span className="mt-1 block text-sm font-semibold text-[#ff7a00]">
          Starting from Rs. {lowestPrice}
        </span>
      ) : null}
      {((sellCount ?? 0) > 0 || (tradeCount ?? 0) > 0) && (
        <span className="mt-1 block text-xs text-zinc-500">
          {[
            sellCount ? `${sellCount} selling` : null,
            tradeCount ? `${tradeCount} trading` : null,
          ]
            .filter(Boolean)
            .join(" · ")}
        </span>
      )}
    </Link>
  );
};

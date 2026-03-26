import Image from "next/image";
import Link from "next/link";

export const ExploreCard = ({
  src,
  name,
  aurthur,
  price,
  link,
  lowestPrice,
  sellCount,
  tradeCount,
}: {
  src: string;
  name: string;
  aurthur: string;
  link: string;
  price: number;
  lowestPrice?: number | null;
  sellCount?: number;
  tradeCount?: number;
}) => {
  return (
    <Link href={link} className="text-center cursor-pointer group">
      <div className="pt-[100%] relative bg-[#F7F8EE] hover:bg-gray-200 transition-colors">
        <figure className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer max-h-[220px] max-w-[45%] shadow-[10px_10px_20px_5px_rgba(0,0,0,0.12)]">
          <Image
            alt={name}
            src={src}
            className="block max-w-full h-auto max-h-[220px]"
            width={380}
            height={480}
          />
        </figure>
      </div>
      <h3 className="body-lg font-bold xl:mt-4 mt-2">{name}</h3>
      <span className="body-md block mt-0.5">{aurthur}</span>
      {lowestPrice !== undefined && lowestPrice !== null && (
        <span className="body-md block mt-1 text-[#FF8D28] font-semibold">
          Starting from Rs. {lowestPrice}
        </span>
      )}
      {((sellCount ?? 0) > 0 || (tradeCount ?? 0) > 0) && (
        <span className="body-sm block mt-0.5 text-[#CACBC3]">
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

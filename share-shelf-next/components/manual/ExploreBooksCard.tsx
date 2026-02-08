import Image from "next/image";
import Link from "next/link";

export const ExploreCard = ({
  src,
  name,
  aurthur,
  price,
  link,
}: {
  src: string;
  name: string;
  aurthur: string;
  link: string;
  price: number;
}) => {
  return (
    <Link href={link} className="text-center cursor-pointer">
      <div className="pt-[100%] relative bg-[#F7F8EE] hover:bg-gray-200">
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
      <span className="body-md block mt-3 text-[#CACBC3]">Rs. {price}</span>
    </Link>
  );
};

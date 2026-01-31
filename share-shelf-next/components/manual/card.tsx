import Image from "next/image";
import { twMerge } from "tailwind-merge";

const BookCard = ({
  img,
  tag,
  title,
  isPopularBook = false,
}: {
  img: string;
  tag: string;
  title: string;
  isPopularBook?: boolean;
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer">
      <div className="relative w-full h-[432px]">
        <Image src={img} alt="Books" fill style={{ objectFit: "cover" }} />
      </div>
      <div className="p-6 text-black">
        <p className="tag font-bold mb-2">{tag}</p>
        <h2
          className={twMerge(
            isPopularBook ? "heading-4" : "heading-3",
            "font-medium tracking-tighter",
          )}
        >
          {title}
        </h2>
      </div>
    </div>
  );
};

export default BookCard;

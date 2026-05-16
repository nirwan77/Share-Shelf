import Image from "next/image";
import Link from "next/link";
import { twMerge } from "tailwind-merge";

const BookCard = ({
  id,
  img,
  tag,
  title,
  isPopularBook = false,
  link,
}: {
  id?: string;
  img: string;
  tag: string;
  title: string;
  isPopularBook?: boolean;
  link?: string;
}) => {
  const content = (
    <div className="app-card app-card-hover group cursor-pointer overflow-hidden">
      <div className="relative h-[300px] w-full overflow-hidden sm:h-[360px] lg:h-[432px]">
        <Image src={img} alt={title} fill style={{ objectFit: "cover" }} className="transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent opacity-85 transition-opacity group-hover:opacity-70" />
        <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
      </div>
      <div className="p-5 text-white sm:p-6">
        <p className="tag font-bold mb-2">{tag}</p>
        <h3
          className={twMerge(
            isPopularBook ? "heading-4" : "heading-3",
            "font-semibold",
          )}
        >
          {title}
        </h3>
      </div>
    </div>
  );

  if (id) {
    return <Link href={`/book-detail/${id}`}>{content}</Link>;
  }

  if (link) {
    return <Link href={link}>{content}</Link>;
  }

  return content;
};

export default BookCard;

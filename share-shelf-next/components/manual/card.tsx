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
    <div className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
      <div className="relative w-full h-[432px]">
        <Image src={img} alt={title} fill style={{ objectFit: "cover" }} />
      </div>
      <div className="p-6 text-black">
        <p className="tag font-bold mb-2">{tag}</p>
        <h3
          className={twMerge(
            isPopularBook ? "heading-4" : "heading-3",
            "font-medium tracking-tighter",
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

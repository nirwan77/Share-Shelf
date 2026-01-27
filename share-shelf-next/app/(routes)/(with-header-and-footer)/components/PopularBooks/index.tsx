"use client";

import BookCard from "@/components/manual/card";
import { useGetChoices } from "../../action";

export const PopularBooks = () => {
  const { data } = useGetChoices();

  console.log(data);

  return (
    <div className="py-30 text-center container mx-auto">
      <h2 className="heading-2 mb-16">Popular books</h2>
      <div className="grid grid-cols-3 gap-8 text-start">
        {data?.slice(4, 7).map((item, idx) => (
          <BookCard
            isPopularBook={true}
            img={item.image}
            key={idx}
            tag={item.bookGenres[0].genre.name}
            title={item.name}
          />
        ))}
      </div>
    </div>
  );
};

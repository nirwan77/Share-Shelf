"use client";

import BookCard from "@/components/manual/card";
import { useGetPopular } from "../../action";

export const PopularBooks = () => {
  const { data } = useGetPopular();

  return (
    <div className="app-section container mx-auto text-center">
      <span className="tag">Trending now</span>
      <h2 className="heading-2 mt-3 mb-12 sm:mb-16">Popular books</h2>
      <div className="grid grid-cols-1 gap-6 text-start md:grid-cols-3 lg:gap-8">
        {data?.map((item, idx) => (
          <BookCard
            id={item.id}
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

"use client";

import BookCard from "@/components/manual/card";
import { useGetFeatured } from "../../action";

export const FeaturedBooks = () => {
  const { data } = useGetFeatured();

  if (!data || data.length === 0) return null;

  return (
    <div className="py-20 text-center container mx-auto border-t border-gray-100">
      <span className="tag font-bold">Featured</span>
      <h2 className="heading-2 mb-16">Editor&apos;s Choices</h2>
      <div className="grid grid-cols-3 gap-8 text-start">
        {data?.map((item, idx) => (
          <BookCard
            isPopularBook={false}
            img={item.image}
            key={idx}
            tag={item.bookGenres[0]?.genre.name || "General"}
            title={item.name}
          />
        ))}
      </div>
    </div>
  );
};

"use client";

import BookCard from "@/components/manual/card";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { useGetProfile } from "../../action";
import Link from "next/link";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export const Library = () => {
  const { data, isLoading } = useGetProfile();

  if (isLoading) return <div className="py-4">Loading your library...</div>;

  const statuses = data?.userBookStatuses || [];
  const reading = statuses.filter((s) => s.status === "READING");
  const read = statuses.filter((s) => s.status === "READ");
  const toRead = statuses.filter((s) => s.status === "PLAN_TO_READ");

  const renderSwiper = (books: typeof statuses) => {
    if (books.length === 0) {
      return <p className="text-gray-400 text-sm mt-2 mb-6">No books in this category yet.</p>;
    }
    return (
      <Swiper
        modules={[Navigation]}
        spaceBetween={16}
        slidesPerView={1.2}
        breakpoints={{
          640: { slidesPerView: 2 },
          768: { slidesPerView: 3 },
          1024: { slidesPerView: 3.5 },
        }}
        navigation
        className="mb-10"
      >
        {books.map((item) => (
          <SwiperSlide key={item.book.id}>
            <Link href={`/book-detail/${item.book.id}`}>
              <BookCard
                img={item.book.image}
                tag={item.book.author}
                title={item.book.name}
              />
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    );
  };

  return (
    <div className="mt-6">
      <h2 className="heading-4 mb-4">
        Reading <span className="text-gray-400">- {reading.length} books</span>
      </h2>
      {renderSwiper(reading)}

      <h2 className="heading-4 mb-4 mt-6">
        Read <span className="text-gray-400">- {read.length} books</span>
      </h2>
      {renderSwiper(read)}

      <h2 className="heading-4 mb-4 mt-6">
        To Read <span className="text-gray-400">- {toRead.length} books</span>
      </h2>
      {renderSwiper(toRead)}
    </div>
  );
};

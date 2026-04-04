"use client";

import BookCard from "@/components/manual/card";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { useGetProfile, type ProfileData } from "../../action";
import Link from "next/link";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export const Library = ({ userProfile }: { userProfile?: ProfileData }) => {
  const { data: ownData, isLoading } = useGetProfile();
  const data = userProfile || ownData;

  if (isLoading && !userProfile) return <div className="py-4">Loading your library...</div>;

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
      <h2 className="text-2xl font-bold text-white mb-4">
        Reading <span className="text-gray-500 font-medium ml-2">- {reading.length} books</span>
      </h2>
      {renderSwiper(reading)}

      <h2 className="text-2xl font-bold text-white mb-4 mt-10">
        Read <span className="text-gray-500 font-medium ml-2">- {read.length} books</span>
      </h2>
      {renderSwiper(read)}

      <h2 className="text-2xl font-bold text-white mb-4 mt-10">
        To Read <span className="text-gray-500 font-medium ml-2">- {toRead.length} books</span>
      </h2>
      {renderSwiper(toRead)}
    </div>
  );
};

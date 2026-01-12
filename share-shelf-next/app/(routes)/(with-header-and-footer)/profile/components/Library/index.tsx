"use client";

import BookCard from "@/components/manual/card";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export const Library = () => {
  return (
    <div className="mt-6">
      <h2 className="heading-4 mb-4">
        Reading <span className="text-gray-400">- 1 books</span>
      </h2>

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
      >
        <SwiperSlide>
          <BookCard
            img="https://covers.openlibrary.org/b/isbn/9780743273565-M.jpg"
            tag="F. Scott Fitzgerald"
            title="The Great Gatsby"
          />
        </SwiperSlide>
        <SwiperSlide>
          <BookCard
            img="https://covers.openlibrary.org/b/isbn/9780743273565-M.jpg"
            tag="F. Scott Fitzgerald"
            title="The Great Gatsby"
          />
        </SwiperSlide>
        <SwiperSlide>
          <BookCard
            img="https://covers.openlibrary.org/b/isbn/9780743273565-M.jpg"
            tag="F. Scott Fitzgerald"
            title="The Great Gatsby"
          />
        </SwiperSlide>
        <SwiperSlide>
          <BookCard
            img="https://covers.openlibrary.org/b/isbn/9780743273565-M.jpg"
            tag="F. Scott Fitzgerald"
            title="The Great Gatsby"
          />
        </SwiperSlide>
        <SwiperSlide>
          <BookCard
            img="https://covers.openlibrary.org/b/isbn/9780743273565-M.jpg"
            tag="F. Scott Fitzgerald"
            title="The Great Gatsby"
          />
        </SwiperSlide>
        <SwiperSlide>
          <BookCard
            img="https://covers.openlibrary.org/b/isbn/9780743273565-M.jpg"
            tag="F. Scott Fitzgerald"
            title="The Great Gatsby"
          />
        </SwiperSlide>
        <SwiperSlide>
          <BookCard
            img="https://covers.openlibrary.org/b/isbn/9780743273565-M.jpg"
            tag="F. Scott Fitzgerald"
            title="The Great Gatsby"
          />
        </SwiperSlide>
      </Swiper>

      <h2 className="heading-4 mb-4 mt-10">
        Read <span className="text-gray-400">- 1 books</span>
      </h2>

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
      >
        <SwiperSlide>
          <BookCard
            img="https://covers.openlibrary.org/b/isbn/9780547928227-M.jpg"
            tag="J.R.R Tolkein"
            title="The hobbit"
          />
        </SwiperSlide>
        <SwiperSlide>
          <BookCard
            img="https://covers.openlibrary.org/b/isbn/9780547928227-M.jpg"
            tag="J.R.R Tolkein"
            title="The hobbit"
          />
        </SwiperSlide>
        <SwiperSlide>
          <BookCard
            img="https://covers.openlibrary.org/b/isbn/9780547928227-M.jpg"
            tag="J.R.R Tolkein"
            title="The hobbit"
          />
        </SwiperSlide>
        <SwiperSlide>
          <BookCard
            img="https://covers.openlibrary.org/b/isbn/9780547928227-M.jpg"
            tag="J.R.R Tolkein"
            title="The hobbit"
          />
        </SwiperSlide>
        <SwiperSlide>
          <BookCard
            img="https://covers.openlibrary.org/b/isbn/9780547928227-M.jpg"
            tag="J.R.R Tolkein"
            title="The hobbit"
          />
        </SwiperSlide>
        <SwiperSlide>
          <BookCard
            img="https://covers.openlibrary.org/b/isbn/9780547928227-M.jpg"
            tag="J.R.R Tolkein"
            title="The hobbit"
          />
        </SwiperSlide>
        <SwiperSlide>
          <BookCard
            img="https://covers.openlibrary.org/b/isbn/9780547928227-M.jpg"
            tag="J.R.R Tolkein"
            title="The hobbit"
          />
        </SwiperSlide>
      </Swiper>

      <h2 className="heading-4 mb-4 mt-10">
        To Read <span className="text-gray-400">- 1 books</span>
      </h2>

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
      >
        <SwiperSlide>
          <BookCard
            img="https://covers.openlibrary.org/b/isbn/9780060850524-M.jpg"
            title="Brave new world"
            tag="Aldous Huxley"
          />
        </SwiperSlide>
        <SwiperSlide>
          <BookCard
            img="https://covers.openlibrary.org/b/isbn/9780060850524-M.jpg"
            title="Brave new world"
            tag="Aldous Huxley"
          />
        </SwiperSlide>
        <SwiperSlide>
          <BookCard
            img="https://covers.openlibrary.org/b/isbn/9780060850524-M.jpg"
            title="Brave new world"
            tag="Aldous Huxley"
          />
        </SwiperSlide>
        <SwiperSlide>
          <BookCard
            img="https://covers.openlibrary.org/b/isbn/9780060850524-M.jpg"
            title="Brave new world"
            tag="Aldous Huxley"
          />
        </SwiperSlide>
        <SwiperSlide>
          <BookCard
            img="https://covers.openlibrary.org/b/isbn/9780060850524-M.jpg"
            title="Brave new world"
            tag="Aldous Huxley"
          />
        </SwiperSlide>
        <SwiperSlide>
          <BookCard
            img="https://covers.openlibrary.org/b/isbn/9780060850524-M.jpg"
            title="Brave new world"
            tag="Aldous Huxley"
          />
        </SwiperSlide>
        <SwiperSlide>
          <BookCard
            img="https://covers.openlibrary.org/b/isbn/9780060850524-M.jpg"
            title="Brave new world"
            tag="Aldous Huxley"
          />
        </SwiperSlide>
      </Swiper>
    </div>
  );
};

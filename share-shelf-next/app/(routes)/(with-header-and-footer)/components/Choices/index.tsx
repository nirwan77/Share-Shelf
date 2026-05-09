"use client";

import Marquee from "react-fast-marquee";
import { useGetFeatured } from "../../action";
import { BookImage } from "@/components/manual/bookImage";
import Link from "next/link";
export const Choices = () => {
  const { data } = useGetFeatured();

  return (
    <section className="relative overflow-hidden py-16 sm:py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,122,0,0.08),transparent_34rem)]" />
      <div className="container relative z-10 mx-auto mb-10 text-center">
        <span className="tag font-bold">Choices</span>
        <h2 className="heading-2 mt-3">Wide range of books</h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-zinc-400 sm:text-base">
          Browse shelf-worthy picks from readers across the community.
        </p>
      </div>
      <div className="relative z-10">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-black to-transparent sm:w-36" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-black to-transparent sm:w-36" />
      <Marquee pauseOnClick={true} speed={74}>
        {data?.slice(0, 4)?.map((item, idx) => (
          <Link key={idx} href={`/book-detail/${item.id}`} className="mr-5 block h-full py-3 transition-transform hover:scale-[1.02]">
            <BookImage src={item.image} name={item.name} />
          </Link>
        ))}
      </Marquee>
      <Marquee
        pauseOnClick={true}
        speed={68}
        className="mt-6"
        direction="right"
      >
        {data?.slice(4, 10).map((item, idx) => (
          <Link key={idx} href={`/book-detail/${item.id}`} className="mr-5 block h-full py-3 transition-transform hover:scale-[1.02]">
            <BookImage src={item.image} name={item.name} />
          </Link>
        ))}
      </Marquee>
      </div>
    </section>
  );
};

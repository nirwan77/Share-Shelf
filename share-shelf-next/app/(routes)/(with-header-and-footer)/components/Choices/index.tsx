"use client";

import Marquee from "react-fast-marquee";
import { useGetChoices } from "../../action";
import { BookImage } from "@/components/manual/bookImage";
export const Choices = () => {
  const { data } = useGetChoices();

  console.log(data);

  return (
    <>
      <div className="text-center container mx-auto">
        <span className="tag font-bold">Choices</span>
        <h2 className="heading-2 mb-16">Wide range of books</h2>
      </div>
      <Marquee pauseOnClick={true} speed={90}>
        {data?.slice(0, 4)?.map((item, idx) => (
          <div key={idx} className="mr-4 h-full">
            <BookImage src={item.image} name={item.name} />
          </div>
        ))}
      </Marquee>
      <Marquee
        pauseOnClick={true}
        speed={90}
        className="mt-6"
        direction="right"
      >
        {data?.slice(4, 10).map((item, idx) => (
          <div key={idx} className="mr-4 h-full">
            <BookImage src={item.image} name={item.name} />
          </div>
        ))}
      </Marquee>
    </>
  );
};
